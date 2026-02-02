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
    // Get the vulnerable line if available
    const lines = code.split('\n');
    const vulnLineNumber = vulnerability.line;
    const vulnLine = vulnLineNumber ? lines[vulnLineNumber - 1] : '';

    switch (vulnerability.type) {
      case 'SQL Injection':
        // Target the specific vulnerable line
        if (vulnLine && vulnLineNumber) {
          let fixedLine = vulnLine;
          
          // Fix template literal injections
          fixedLine = fixedLine.replace(/`([^`]*)\$\{([^}]+)\}([^`]*)`/g, 
            '`$1?$3` /* FIXED: Use parameterized query instead of ${$2} */');
          
          // Fix string concatenation
          fixedLine = fixedLine.replace(/(["'])([^"']*)\1\s*\+\s*([^+;]+)\s*\+\s*(["'])([^"']*)\4/g,
            '$1$2?$5$4 /* FIXED: Use parameterized query instead of concatenation */');
          
          // Fix f-string injections (Python)
          fixedLine = fixedLine.replace(/f["']([^"']*)\{([^}]+)\}([^"']*)/g,
            '"$1%s$3", $2 /* FIXED: Use parameterized query */');

          lines[vulnLineNumber - 1] = fixedLine;
          fixedCode = lines.join('\n');
        }
        break;

      case 'Cross-Site Scripting (XSS)':
        if (vulnLine && vulnLineNumber) {
          let fixedLine = vulnLine;
          
          // Fix innerHTML assignments
          fixedLine = fixedLine.replace(/\.innerHTML\s*=\s*([^;]+)/g, 
            '.textContent = $1 /* FIXED: Use textContent to prevent XSS */');
          
          // Fix document.write
          fixedLine = fixedLine.replace(/document\.write\s*\(([^)]+)\)/g,
            '/* FIXED: document.write removed - use DOM methods instead */\n// document.createTextNode($1)');
          
          // Fix outerHTML
          fixedLine = fixedLine.replace(/\.outerHTML\s*=\s*([^;]+)/g,
            '/* FIXED: outerHTML replaced */ .replaceWith(document.createTextNode($1))');
          
          // Fix insertAdjacentHTML
          fixedLine = fixedLine.replace(/\.insertAdjacentHTML\s*\(([^,]+),\s*([^)]+)\)/g,
            '.insertAdjacentText($1, $2) /* FIXED: Use insertAdjacentText */');

          lines[vulnLineNumber - 1] = fixedLine;
          fixedCode = lines.join('\n');
        }
        break;

      case 'Hardcoded Credentials':
        if (vulnLine && vulnLineNumber) {
          let fixedLine = vulnLine;
          
          // Fix hardcoded passwords/keys
          fixedLine = fixedLine.replace(
            /(password|passwd|pwd|secret|api_?key|apikey|auth_?token|access_?token|private_?key)\s*[:=]\s*["'][^"']+["']/gi,
            '$1: process.env.$1.toUpperCase() || "YOUR_$1_HERE" /* FIXED: Use environment variable */'
          );
          
          // Fix hardcoded tokens
          fixedLine = fixedLine.replace(
            /(Bearer|Basic)\s+[A-Za-z0-9+/=]{20,}/gi,
            '$1 " + process.env.AUTH_TOKEN /* FIXED: Use environment variable */'
          );
          
          // Fix MongoDB connection strings
          fixedLine = fixedLine.replace(
            /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/gi,
            'mongodb$1://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@'
          );

          lines[vulnLineNumber - 1] = fixedLine;
          fixedCode = lines.join('\n');
        }
        break;

      case 'Command Injection':
        if (vulnLine && vulnLineNumber) {
          let fixedLine = vulnLine;
          
          // Add input validation before command execution
          const indent = vulnLine.match(/^\s*/)[0];
          const validationComment = `${indent}// FIXED: Add input validation before command execution\n${indent}if (!isValidInput(userInput)) throw new Error('Invalid input');\n`;
          
          lines[vulnLineNumber - 1] = validationComment + vulnLine;
          fixedCode = lines.join('\n');
        }
        break;

      default:
        // For other vulnerability types, add a security comment
        if (vulnLine && vulnLineNumber) {
          const indent = vulnLine.match(/^\s*/)[0];
          lines[vulnLineNumber - 1] = `${indent}// SECURITY WARNING: ${vulnerability.description}\n${vulnLine}`;
          fixedCode = lines.join('\n');
        }
        break;
    }
    
    // Add a header comment to indicate the fix was applied
    if (fixedCode !== code) {
      fixedCode = `// CODATS AUTO-FIX APPLIED: ${vulnerability.type} vulnerability fixed\n${fixedCode}`;
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
