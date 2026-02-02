/**
 * CODATS - Code Scanner Module
 * Scans source code for security vulnerabilities using rule-based analysis
 */

const { vulnerabilityRules } = require('./rules');

/**
 * Scan code for vulnerabilities
 * @param {string} code - The source code to scan
 * @param {string} language - Programming language (js, py, java, php)
 * @returns {Object} - Scan results with vulnerabilities and risk score
 */
const scanCode = (code, language = 'js') => {
  const vulnerabilities = [];
  const lines = code.split('\n');
  
  // Iterate through each rule category
  Object.entries(vulnerabilityRules).forEach(([ruleKey, rule]) => {
    rule.patterns.forEach(pattern => {
      // Check each line for matches
      lines.forEach((line, index) => {
        const matches = line.match(pattern.regex);
        if (matches) {
          // Check if this vulnerability already exists at this line
          const existingVuln = vulnerabilities.find(
            v => v.line === index + 1 && v.type === rule.name
          );
          
          if (!existingVuln) {
            vulnerabilities.push({
              id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: rule.name,
              severity: rule.severity,
              severityScore: rule.severityScore,
              line: index + 1,
              column: line.indexOf(matches[0]) + 1,
              snippet: line.trim(),
              description: pattern.description,
              fix: rule.fix,
              ruleKey: ruleKey
            });
          }
        }
      });
      
      // Also check for multi-line patterns
      const fullCodeMatches = code.match(pattern.regex);
      if (fullCodeMatches) {
        fullCodeMatches.forEach(match => {
          // Find line number for the match
          const beforeMatch = code.substring(0, code.indexOf(match));
          const lineNumber = beforeMatch.split('\n').length;
          
          // Check if vulnerability already recorded
          const existingVuln = vulnerabilities.find(
            v => v.line === lineNumber && v.type === rule.name
          );
          
          if (!existingVuln && !vulnerabilities.find(v => v.snippet === match.trim())) {
            // Avoid duplicate from line-by-line check
            const alreadyFound = vulnerabilities.some(
              v => v.line === lineNumber && v.type === rule.name
            );
            
            if (!alreadyFound) {
              vulnerabilities.push({
                id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: rule.name,
                severity: rule.severity,
                severityScore: rule.severityScore,
                line: lineNumber,
                column: 1,
                snippet: match.trim().substring(0, 100) + (match.length > 100 ? '...' : ''),
                description: pattern.description,
                fix: rule.fix,
                ruleKey: ruleKey
              });
            }
          }
        });
      }
    });
  });

  // Remove duplicates based on line number and type
  const uniqueVulnerabilities = vulnerabilities.reduce((acc, current) => {
    const exists = acc.find(
      item => item.line === current.line && item.type === current.type
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Sort by line number
  uniqueVulnerabilities.sort((a, b) => a.line - b.line);

  // Calculate overall risk score
  const riskScore = calculateRiskScore(uniqueVulnerabilities);

  return {
    vulnerabilities: uniqueVulnerabilities,
    riskScore,
    totalVulnerabilities: uniqueVulnerabilities.length,
    summary: generateSummary(uniqueVulnerabilities),
    scannedAt: new Date().toISOString(),
    language
  };
};

/**
 * Calculate overall risk score based on found vulnerabilities
 * @param {Array} vulnerabilities - Array of vulnerability objects
 * @returns {number} - Risk score from 0-100
 */
const calculateRiskScore = (vulnerabilities) => {
  if (vulnerabilities.length === 0) {
    return 0;
  }

  // Weight by severity
  const severityWeights = {
    'Critical': 25,
    'High': 15,
    'Medium': 8,
    'Low': 3
  };

  let totalScore = 0;
  
  vulnerabilities.forEach(vuln => {
    totalScore += severityWeights[vuln.severity] || 5;
  });

  // Cap at 100
  return Math.min(100, totalScore);
};

/**
 * Generate a summary of vulnerabilities by type and severity
 * @param {Array} vulnerabilities - Array of vulnerability objects
 * @returns {Object} - Summary statistics
 */
const generateSummary = (vulnerabilities) => {
  const bySeverity = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0
  };

  const byType = {};

  vulnerabilities.forEach(vuln => {
    // Count by severity
    if (bySeverity.hasOwnProperty(vuln.severity)) {
      bySeverity[vuln.severity]++;
    }

    // Count by type
    if (!byType[vuln.type]) {
      byType[vuln.type] = 0;
    }
    byType[vuln.type]++;
  });

  return {
    bySeverity,
    byType,
    total: vulnerabilities.length
  };
};

/**
 * Get language-specific patterns
 * @param {string} language - Programming language
 * @returns {Array} - Applicable rules for the language
 */
const getLanguageSpecificRules = (language) => {
  const languagePatterns = {
    js: ['sqlInjection', 'xss', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'insecureCrypto', 'insecureConfig', 'informationDisclosure'],
    javascript: ['sqlInjection', 'xss', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'insecureCrypto', 'insecureConfig', 'informationDisclosure'],
    py: ['sqlInjection', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'insecureCrypto', 'insecureConfig', 'informationDisclosure'],
    python: ['sqlInjection', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'insecureCrypto', 'insecureConfig', 'informationDisclosure'],
    java: ['sqlInjection', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'insecureCrypto', 'informationDisclosure'],
    php: ['sqlInjection', 'xss', 'hardcodedCredentials', 'commandInjection', 'unsafeFunctions', 'pathTraversal', 'informationDisclosure']
  };

  return languagePatterns[language.toLowerCase()] || languagePatterns.js;
};

/**
 * Detect language from file extension
 * @param {string} filename - Name of the file
 * @returns {string} - Detected language
 */
const detectLanguage = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp'
  };

  return languageMap[extension] || 'javascript';
};

module.exports = {
  scanCode,
  calculateRiskScore,
  generateSummary,
  getLanguageSpecificRules,
  detectLanguage
};
