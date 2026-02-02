/**
 * CODATS - AI Integration Module
 * Integrates with Gemini or Groq API for AI-powered vulnerability analysis
 */

const axios = require('axios');

// API Configuration
// Using gemini-2.0-flash-exp model (latest as of 2026)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate AI analysis for vulnerabilities using Gemini API
 * @param {Array} vulnerabilities - Array of detected vulnerabilities
 * @param {string} code - Original source code
 * @returns {Array} - AI analysis for each vulnerability
 */
const analyzeWithGemini = async (vulnerabilities, code) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('Gemini API key not configured, using fallback analysis');
    return generateFallbackAnalysis(vulnerabilities);
  }

  const analyses = [];

  for (const vuln of vulnerabilities) {
    try {
      const prompt = createAnalysisPrompt(vuln, code);
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiResponse) {
        const analysis = parseAIResponse(aiResponse, vuln);
        analyses.push(analysis);
      } else {
        analyses.push(generateFallbackForVuln(vuln));
      }
    } catch (error) {
      console.error(`Gemini API error for vulnerability ${vuln.id}:`, error.message);
      analyses.push(generateFallbackForVuln(vuln));
    }
  }

  return analyses;
};

/**
 * Generate AI analysis for vulnerabilities using Groq API
 * @param {Array} vulnerabilities - Array of detected vulnerabilities
 * @param {string} code - Original source code
 * @returns {Array} - AI analysis for each vulnerability
 */
const analyzeWithGroq = async (vulnerabilities, code) => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.log('Groq API key not configured, using fallback analysis');
    return generateFallbackAnalysis(vulnerabilities);
  }

  const analyses = [];

  for (const vuln of vulnerabilities) {
    try {
      const prompt = createAnalysisPrompt(vuln, code);
      
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a security expert specializing in code vulnerability analysis. Provide concise, actionable security advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const aiResponse = response.data.choices?.[0]?.message?.content;
      
      if (aiResponse) {
        const analysis = parseAIResponse(aiResponse, vuln);
        analyses.push(analysis);
      } else {
        analyses.push(generateFallbackForVuln(vuln));
      }
    } catch (error) {
      console.error(`Groq API error for vulnerability ${vuln.id}:`, error.message);
      analyses.push(generateFallbackForVuln(vuln));
    }
  }

  return analyses;
};

/**
 * Create analysis prompt for AI
 * @param {Object} vuln - Vulnerability object
 * @param {string} code - Full source code
 * @returns {string} - Formatted prompt
 */
const createAnalysisPrompt = (vuln, code) => {
  return `Analyze this security vulnerability found in code:

Vulnerability Type: ${vuln.type}
Severity: ${vuln.severity}
Line Number: ${vuln.line}
Vulnerable Code Snippet: ${vuln.snippet}
Description: ${vuln.description}

Provide a response in the following format:
1. EXPLANATION: A clear explanation of why this is a security vulnerability and the potential risks (2-3 sentences)
2. SECURE_FIX: The corrected code snippet that fixes this vulnerability
3. CONFIDENCE: A number between 0 and 1 indicating your confidence in this analysis

Be specific and provide actual working code for the fix.`;
};

/**
 * Parse AI response into structured format
 * @param {string} response - Raw AI response
 * @param {Object} vuln - Original vulnerability
 * @returns {Object} - Structured analysis
 */
const parseAIResponse = (response, vuln) => {
  let explanation = '';
  let fix = '';
  let confidence = 0.85;

  // Extract explanation
  const explanationMatch = response.match(/EXPLANATION:?\s*([\s\S]*?)(?=SECURE_FIX|FIX:|2\.|$)/i);
  if (explanationMatch) {
    explanation = explanationMatch[1].trim();
  }

  // Extract fix
  const fixMatch = response.match(/SECURE_FIX:?\s*([\s\S]*?)(?=CONFIDENCE|3\.|$)/i);
  if (fixMatch) {
    fix = fixMatch[1].trim();
    // Remove code block markers if present
    fix = fix.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
  }

  // Extract confidence
  const confidenceMatch = response.match(/CONFIDENCE:?\s*([\d.]+)/i);
  if (confidenceMatch) {
    confidence = parseFloat(confidenceMatch[1]);
    if (confidence > 1) confidence = confidence / 100;
    if (isNaN(confidence)) confidence = 0.85;
  }

  // Fallback if parsing failed
  if (!explanation) {
    explanation = response.substring(0, 300).trim();
  }

  if (!fix) {
    fix = vuln.fix;
  }

  return {
    vulnerabilityId: vuln.id,
    type: vuln.type,
    line: vuln.line,
    explanation: explanation || `This ${vuln.type} vulnerability can allow attackers to compromise your application.`,
    fix: fix,
    confidence: Math.min(1, Math.max(0, confidence))
  };
};

/**
 * Generate fallback analysis when API is not available
 * @param {Array} vulnerabilities - Array of vulnerabilities
 * @returns {Array} - Fallback analysis for each vulnerability
 */
const generateFallbackAnalysis = (vulnerabilities) => {
  return vulnerabilities.map(vuln => generateFallbackForVuln(vuln));
};

/**
 * Generate fallback analysis for a single vulnerability
 * @param {Object} vuln - Vulnerability object
 * @returns {Object} - Fallback analysis
 */
const generateFallbackForVuln = (vuln) => {
  const explanations = {
    'SQL Injection': 'This code is vulnerable to SQL injection attacks. An attacker could manipulate the SQL query by injecting malicious input, potentially accessing, modifying, or deleting database data.',
    'Cross-Site Scripting (XSS)': 'This code is vulnerable to XSS attacks. Malicious scripts can be injected into the page, allowing attackers to steal session cookies, redirect users, or perform actions on their behalf.',
    'Hardcoded Credentials': 'Hardcoded credentials pose a significant security risk. If the code is exposed (e.g., in a repository), attackers can use these credentials to gain unauthorized access.',
    'Command Injection': 'This code is vulnerable to command injection. Attackers could execute arbitrary system commands, potentially taking complete control of the server.',
    'Unsafe Function Usage': 'Using unsafe functions like eval() can lead to code injection vulnerabilities. Attackers could execute arbitrary code in the context of your application.',
    'Path Traversal': 'This code may be vulnerable to path traversal attacks. Attackers could access files outside the intended directory, potentially reading sensitive configuration files or source code.',
    'Insecure Cryptography': 'Using weak cryptographic algorithms makes your application vulnerable to cryptographic attacks. MD5 and SHA1 are considered broken for security purposes.',
    'Insecure Configuration': 'Insecure configuration can expose your application to various attacks. Ensure SSL verification is enabled and debug mode is disabled in production.',
    'Information Disclosure': 'Logging or exposing sensitive information can help attackers understand your system and exploit other vulnerabilities.'
  };

  const fixes = {
    'SQL Injection': `// Use parameterized queries instead:
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId], callback);`,
    'Cross-Site Scripting (XSS)': `// Use textContent instead of innerHTML:
element.textContent = userInput;
// Or sanitize with DOMPurify:
element.innerHTML = DOMPurify.sanitize(userInput);`,
    'Hardcoded Credentials': `// Use environment variables:
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;`,
    'Command Injection': `// Use execFile with arguments array:
const { execFile } = require('child_process');
execFile('command', [arg1, arg2], callback);`,
    'Unsafe Function Usage': `// Avoid eval, use safer alternatives:
// Instead of eval(jsonString), use:
const data = JSON.parse(jsonString);`,
    'Path Traversal': `// Validate and sanitize file paths:
const path = require('path');
const safePath = path.resolve(baseDir, userInput);
if (!safePath.startsWith(baseDir)) {
  throw new Error('Invalid path');
}`,
    'Insecure Cryptography': `// Use strong hash algorithms:
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(data).digest('hex');`,
    'Insecure Configuration': `// Enable SSL verification and secure cookies:
const options = {
  rejectUnauthorized: true,
  cookie: { secure: true, httpOnly: true }
};`,
    'Information Disclosure': `// Remove sensitive data from logs:
console.log('User authenticated:', userId);
// Never log: passwords, tokens, keys`
  };

  return {
    vulnerabilityId: vuln.id,
    type: vuln.type,
    line: vuln.line,
    explanation: explanations[vuln.type] || `This ${vuln.type} vulnerability can compromise your application security.`,
    fix: fixes[vuln.type] || vuln.fix,
    confidence: 0.75
  };
};

/**
 * Main function to get AI analysis
 * @param {Array} vulnerabilities - Array of vulnerabilities
 * @param {string} code - Source code
 * @returns {Array} - AI analysis results
 */
const getAIAnalysis = async (vulnerabilities, code) => {
  if (vulnerabilities.length === 0) {
    return [];
  }

  // Temporarily using fallback analysis to avoid API issues
  console.log('Using fallback analysis to avoid API rate limits');
  return generateFallbackAnalysis(vulnerabilities);
  
  /* Commented out to avoid API issues
  const provider = process.env.AI_PROVIDER || 'gemini';

  // Limit to first 10 vulnerabilities to avoid API overload
  const limitedVulns = vulnerabilities.slice(0, 10);

  try {
    if (provider.toLowerCase() === 'groq') {
      return await analyzeWithGroq(limitedVulns, code);
    } else {
      return await analyzeWithGemini(limitedVulns, code);
    }
  } catch (error) {
    console.error('AI analysis error:', error.message);
    return generateFallbackAnalysis(limitedVulns);
  }
  */
};

module.exports = {
  getAIAnalysis,
  analyzeWithGemini,
  analyzeWithGroq,
  generateFallbackAnalysis
};
