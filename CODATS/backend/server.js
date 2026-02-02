/**
 * CODATS - Code Analysis & Threat Scanning System
 * Main Server File
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection and routes
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');

const { scanCode, detectLanguage } = require('./scanner');
const { getAIAnalysis } = require('./ai/gemini');

/**
 * Apply basic security fixes to code
 * @param {string} code - Original code
 * @param {Object} vulnerability - Vulnerability object
 * @returns {string} - Fixed code
 */
function applyBasicFix(code, vulnerability) {
  let fixedCode = code;

  try {
    switch (vulnerability.type) {
      case 'SQL Injection':
        // Replace basic SQL injection patterns
        fixedCode = fixedCode.replace(
          /["']\s*\+\s*[\w.]+\s*\+\s*["']/g,
          '? /* Use parameterized query */'
        );
        break;

      case 'XSS (Cross-Site Scripting)':
        // Replace innerHTML with textContent
        fixedCode = fixedCode.replace(
          /\.innerHTML\s*=\s*([^;]+)/g,
          '.textContent = $1 /* Safer than innerHTML */'
        );
        break;

      case 'Hardcoded Credentials':
        // Replace hardcoded passwords/keys
        fixedCode = fixedCode.replace(
          /(password|key|secret|token)\s*[:=]\s*["'][^"']+["']/gi,
          '$1: process.env.YOUR_$1_HERE /* Use environment variables */'
        );
        break;

      case 'Command Injection':
        // Add warning comment for command injection
        fixedCode = fixedCode.replace(
          /(exec|spawn|system)\s*\(/g,
          '$1( /* WARNING: Validate and sanitize inputs */ '
        );
        break;

      default:
        // Add a comment indicating the security issue
        const lines = fixedCode.split('\n');
        if (vulnerability.line && vulnerability.line <= lines.length) {
          lines[vulnerability.line - 1] = `// SECURITY: ${vulnerability.description}\n${lines[vulnerability.line - 1]}`;
          fixedCode = lines.join('\n');
        }
        break;
    }
  } catch (error) {
    console.error('Error applying fix:', error);
    return code; // Return original code if fix fails
  }

  return fixedCode;
}

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.php', '.rb', '.go', '.c', '.cpp', '.cs'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not supported. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CODATS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Main scan endpoint - accepts code directly
 * POST /api/scan
 * Body: { code: "...", language: "js" }
 */
app.post('/api/scan', auth, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a string'
      });
    }

    if (code.length > 500000) {
      return res.status(400).json({
        success: false,
        error: 'Code exceeds maximum length of 500,000 characters'
      });
    }

    console.log(`Scanning ${code.length} characters of ${language} code...`);

    // Scan for vulnerabilities
    const scanResults = scanCode(code, language);
    
    // Get AI analysis if vulnerabilities found
    let aiAnalysis = [];
    if (scanResults.vulnerabilities.length > 0) {
      console.log(`Found ${scanResults.vulnerabilities.length} vulnerabilities, getting AI analysis...`);
      aiAnalysis = await getAIAnalysis(scanResults.vulnerabilities, code);
    }

    // Combine results
    const response = {
      success: true,
      ...scanResults,
      aiAnalysis,
      message: scanResults.vulnerabilities.length > 0 
        ? `Found ${scanResults.vulnerabilities.length} potential security issues`
        : 'No vulnerabilities detected'
    };

    res.json(response);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan code',
      details: error.message
    });
  }
});

/**
 * File upload scan endpoint
 * POST /api/scan/upload
 * Body: multipart/form-data with 'file' field
 */
app.post('/api/scan/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;
    
    console.log(`Processing uploaded file: ${filename}`);

    // Read file content
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Detect language from file extension
    const language = detectLanguage(filename);
    
    // Scan for vulnerabilities
    const scanResults = scanCode(code, language);
    
    // Get AI analysis if vulnerabilities found
    let aiAnalysis = [];
    if (scanResults.vulnerabilities.length > 0) {
      console.log(`Found ${scanResults.vulnerabilities.length} vulnerabilities, getting AI analysis...`);
      aiAnalysis = await getAIAnalysis(scanResults.vulnerabilities, code);
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Combine results
    const response = {
      success: true,
      filename,
      ...scanResults,
      aiAnalysis,
      message: scanResults.vulnerabilities.length > 0 
        ? `Found ${scanResults.vulnerabilities.length} potential security issues in ${filename}`
        : 'No vulnerabilities detected'
    };

    res.json(response);
  } catch (error) {
    console.error('File scan error:', error);
    
    // Clean up file if exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to scan uploaded file',
      details: error.message
    });
  }
});

/**
 * Get AI fix for a specific vulnerability
 * POST /api/fix
 * Body: { vulnerability: {...}, code: "..." }
 */
app.post('/api/fix', auth, async (req, res) => {
  try {
    const { vulnerability, code } = req.body;

    if (!vulnerability || !code) {
      return res.status(400).json({
        success: false,
        error: 'Vulnerability details and code are required'
      });
    }

    // Generate a fixed version of the code
    const fixedCode = applyBasicFix(code, vulnerability);

    res.json({
      success: true,
      fixedCode: fixedCode,
      fix: {
        vulnerabilityId: vulnerability.id,
        explanation: vulnerability.description,
        fix: vulnerability.fix,
        confidence: 0.8
      }
    });
  } catch (error) {
    console.error('Fix generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate fix',
      details: error.message
    });
  }
});

/**
 * Get supported languages
 * GET /api/languages
 */
app.get('/api/languages', (req, res) => {
  res.json({
    success: true,
    languages: [
      { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx'] },
      { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'] },
      { id: 'python', name: 'Python', extensions: ['.py'] },
      { id: 'java', name: 'Java', extensions: ['.java'] },
      { id: 'php', name: 'PHP', extensions: ['.php'] },
      { id: 'go', name: 'Go', extensions: ['.go'] },
      { id: 'ruby', name: 'Ruby', extensions: ['.rb'] },
      { id: 'c', name: 'C', extensions: ['.c'] },
      { id: 'cpp', name: 'C++', extensions: ['.cpp', '.cc'] },
      { id: 'csharp', name: 'C#', extensions: ['.cs'] }
    ]
  });
});

/**
 * Get vulnerability rules
 * GET /api/rules
 */
app.get('/api/rules', (req, res) => {
  const { vulnerabilityRules } = require('./rules');
  
  const rules = Object.entries(vulnerabilityRules).map(([key, rule]) => ({
    id: key,
    name: rule.name,
    severity: rule.severity,
    severityScore: rule.severityScore,
    description: rule.fix,
    patternCount: rule.patterns.length
  }));

  res.json({
    success: true,
    rules
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }
  
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     CODATS - Code Analysis & Threat Scanning System       ║
║                                                           ║
║     Server running on http://localhost:${PORT}              ║
║                                                           ║
║     Endpoints:                                            ║
║     • POST /api/scan        - Scan code                   ║
║     • POST /api/scan/upload - Upload and scan file        ║
║     • POST /api/fix         - Get AI fix recommendation   ║
║     • GET  /api/languages   - Get supported languages     ║
║     • GET  /api/rules       - Get vulnerability rules     ║
║     • GET  /api/health      - Health check                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
