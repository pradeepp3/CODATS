/**
 * CODATS - Security Vulnerability Detection Rules
 * Rule-based patterns for detecting common security vulnerabilities
 */

const vulnerabilityRules = {
  // SQL Injection patterns
  sqlInjection: {
    name: 'SQL Injection',
    severity: 'Critical',
    severityScore: 95,
    patterns: [
      {
        regex: /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*(\+\s*req\.(query|body|params)|`\$\{|'\s*\+\s*|"\s*\+\s*)/gi,
        description: 'SQL query concatenation with user input'
      },
      {
        regex: /execute\s*\(\s*["'`].*(\$\{|\+\s*req\.|%s)/gi,
        description: 'Dynamic SQL execution with user input'
      },
      {
        regex: /query\s*\(\s*["'`].*(\$\{|\+\s*(req\.|user|input|data))/gi,
        description: 'Database query with string concatenation'
      },
      {
        regex: /cursor\.execute\s*\(\s*["'`].*%.*%\s*\(/gi,
        description: 'Python SQL injection via string formatting'
      },
      {
        regex: /\.query\s*\(\s*`[^`]*\$\{/gi,
        description: 'Template literal SQL injection'
      },
      {
        regex: /f["']SELECT.*\{.*\}/gi,
        description: 'Python f-string SQL injection'
      }
    ],
    fix: 'Use parameterized queries or prepared statements instead of string concatenation.'
  },

  // Cross-Site Scripting (XSS) patterns
  xss: {
    name: 'Cross-Site Scripting (XSS)',
    severity: 'High',
    severityScore: 80,
    patterns: [
      {
        regex: /\.innerHTML\s*=\s*(?!['"`]\s*['"`])/gi,
        description: 'Direct innerHTML assignment'
      },
      {
        regex: /\.outerHTML\s*=\s*/gi,
        description: 'Direct outerHTML assignment'
      },
      {
        regex: /document\.write\s*\(/gi,
        description: 'document.write usage'
      },
      {
        regex: /\.insertAdjacentHTML\s*\(/gi,
        description: 'insertAdjacentHTML usage'
      },
      {
        regex: /dangerouslySetInnerHTML/gi,
        description: 'React dangerouslySetInnerHTML usage'
      },
      {
        regex: /\{\{\s*.*\s*\|\s*safe\s*\}\}/gi,
        description: 'Template safe filter bypassing escaping'
      },
      {
        regex: /v-html\s*=/gi,
        description: 'Vue v-html directive'
      },
      {
        regex: /\[innerHTML\]\s*=/gi,
        description: 'Angular innerHTML binding'
      }
    ],
    fix: 'Use textContent instead of innerHTML, or sanitize HTML input using DOMPurify or similar libraries.'
  },

  // Hardcoded Credentials patterns
  hardcodedCredentials: {
    name: 'Hardcoded Credentials',
    severity: 'High',
    severityScore: 85,
    patterns: [
      {
        regex: /(password|passwd|pwd|secret|api_?key|apikey|auth_?token|access_?token|private_?key)\s*[:=]\s*["'`][^"'`]{3,}["'`]/gi,
        description: 'Hardcoded password or secret'
      },
      {
        regex: /(Bearer|Basic)\s+[A-Za-z0-9+/=]{20,}/gi,
        description: 'Hardcoded authentication token'
      },
      {
        regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
        description: 'Hardcoded private key'
      },
      {
        regex: /aws_?(access_?key_?id|secret_?access_?key)\s*[:=]\s*["'`][A-Z0-9]{16,}["'`]/gi,
        description: 'Hardcoded AWS credentials'
      },
      {
        regex: /["'`](sk-[A-Za-z0-9]{32,})["'`]/gi,
        description: 'Hardcoded OpenAI API key'
      },
      {
        regex: /["'`](ghp_[A-Za-z0-9]{36,})["'`]/gi,
        description: 'Hardcoded GitHub personal access token'
      },
      {
        regex: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi,
        description: 'Hardcoded MongoDB connection string with credentials'
      },
      {
        regex: /postgres:\/\/[^:]+:[^@]+@/gi,
        description: 'Hardcoded PostgreSQL connection string with credentials'
      }
    ],
    fix: 'Store credentials in environment variables or use a secrets management service.'
  },

  // Command Injection patterns
  commandInjection: {
    name: 'Command Injection',
    severity: 'Critical',
    severityScore: 95,
    patterns: [
      {
        regex: /child_process\.(exec|execSync|spawn|spawnSync)\s*\([^)]*(\+|`\$\{|req\.|user|input)/gi,
        description: 'Node.js command injection via child_process'
      },
      {
        regex: /os\.system\s*\([^)]*(\+|f["']|%|\.format\()/gi,
        description: 'Python os.system command injection'
      },
      {
        regex: /subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True/gi,
        description: 'Python subprocess with shell=True'
      },
      {
        regex: /Runtime\.getRuntime\(\)\.exec\s*\(/gi,
        description: 'Java Runtime.exec command execution'
      },
      {
        regex: /ProcessBuilder\s*\([^)]*\+/gi,
        description: 'Java ProcessBuilder with string concatenation'
      },
      {
        regex: /shell_exec\s*\(\s*\$/gi,
        description: 'PHP shell_exec with variable'
      },
      {
        regex: /`[^`]*\$[^`]*`/gi,
        description: 'Shell command with variable interpolation'
      },
      {
        regex: /system\s*\(\s*\$/gi,
        description: 'PHP system() with variable'
      },
      {
        regex: /passthru\s*\(\s*\$/gi,
        description: 'PHP passthru() with variable'
      }
    ],
    fix: 'Avoid using shell commands with user input. If necessary, use allowlists and proper input validation.'
  },

  // Unsafe Functions patterns
  unsafeFunctions: {
    name: 'Unsafe Function Usage',
    severity: 'High',
    severityScore: 75,
    patterns: [
      {
        regex: /\beval\s*\(/gi,
        description: 'eval() function usage'
      },
      {
        regex: /new\s+Function\s*\(/gi,
        description: 'new Function() constructor'
      },
      {
        regex: /setTimeout\s*\(\s*["'`]/gi,
        description: 'setTimeout with string argument'
      },
      {
        regex: /setInterval\s*\(\s*["'`]/gi,
        description: 'setInterval with string argument'
      },
      {
        regex: /\bexec\s*\(/gi,
        description: 'exec() function usage'
      },
      {
        regex: /pickle\.loads?\s*\(/gi,
        description: 'Python pickle deserialization'
      },
      {
        regex: /yaml\.load\s*\([^)]*Loader\s*=\s*yaml\.Loader/gi,
        description: 'Python unsafe YAML loading'
      },
      {
        regex: /unserialize\s*\(\s*\$/gi,
        description: 'PHP unserialize with user input'
      },
      {
        regex: /deserialize|fromJson|JSON\.parse\s*\(\s*(req\.|user|input)/gi,
        description: 'Deserialization of user input'
      },
      {
        regex: /assert\s*\(\s*\$/gi,
        description: 'PHP assert with variable (code execution)'
      }
    ],
    fix: 'Avoid using eval() and similar dynamic code execution functions. Use safer alternatives.'
  },

  // Path Traversal patterns
  pathTraversal: {
    name: 'Path Traversal',
    severity: 'High',
    severityScore: 80,
    patterns: [
      {
        regex: /\.\.(\/|\\)/gi,
        description: 'Directory traversal sequence'
      },
      {
        regex: /(readFile|readFileSync|createReadStream)\s*\([^)]*(\+|`\$\{|req\.)/gi,
        description: 'File read with user input'
      },
      {
        regex: /(writeFile|writeFileSync|createWriteStream)\s*\([^)]*(\+|`\$\{|req\.)/gi,
        description: 'File write with user input'
      },
      {
        regex: /open\s*\([^)]*(\+|f["']|%|\.format\()/gi,
        description: 'Python file open with user input'
      },
      {
        regex: /include\s*\(\s*\$/gi,
        description: 'PHP include with variable'
      },
      {
        regex: /require\s*\(\s*\$/gi,
        description: 'PHP require with variable'
      }
    ],
    fix: 'Validate and sanitize file paths. Use path.resolve() and check against allowed directories.'
  },

  // Insecure Cryptography patterns
  insecureCrypto: {
    name: 'Insecure Cryptography',
    severity: 'Medium',
    severityScore: 60,
    patterns: [
      {
        regex: /createHash\s*\(\s*["'`](md5|sha1)["'`]\s*\)/gi,
        description: 'Weak hash algorithm (MD5/SHA1)'
      },
      {
        regex: /hashlib\.(md5|sha1)\s*\(/gi,
        description: 'Python weak hash algorithm'
      },
      {
        regex: /MessageDigest\.getInstance\s*\(\s*["'`](MD5|SHA-?1)["'`]\s*\)/gi,
        description: 'Java weak hash algorithm'
      },
      {
        regex: /DES|RC4|Blowfish/gi,
        description: 'Weak encryption algorithm'
      },
      {
        regex: /Math\.random\s*\(\s*\)/gi,
        description: 'Math.random() for security purposes'
      },
      {
        regex: /random\.random\s*\(\s*\)/gi,
        description: 'Python random.random() for security'
      }
    ],
    fix: 'Use strong cryptographic algorithms like SHA-256, AES-256, and cryptographically secure random number generators.'
  },

  // Insecure Configuration patterns
  insecureConfig: {
    name: 'Insecure Configuration',
    severity: 'Medium',
    severityScore: 55,
    patterns: [
      {
        regex: /disable.*ssl|ssl.*false|verify.*false|rejectUnauthorized.*false/gi,
        description: 'SSL/TLS verification disabled'
      },
      {
        regex: /DEBUG\s*=\s*True/gi,
        description: 'Debug mode enabled in production'
      },
      {
        regex: /CORS.*\*|Access-Control-Allow-Origin.*\*/gi,
        description: 'Permissive CORS configuration'
      },
      {
        regex: /httpOnly\s*:\s*false/gi,
        description: 'Cookie without httpOnly flag'
      },
      {
        regex: /secure\s*:\s*false/gi,
        description: 'Cookie without secure flag'
      }
    ],
    fix: 'Enable SSL verification, disable debug mode in production, and configure secure cookie flags.'
  },

  // Information Disclosure patterns
  informationDisclosure: {
    name: 'Information Disclosure',
    severity: 'Low',
    severityScore: 40,
    patterns: [
      {
        regex: /console\.(log|debug|info)\s*\([^)]*password|secret|key|token/gi,
        description: 'Logging sensitive information'
      },
      {
        regex: /print\s*\([^)]*password|secret|key|token/gi,
        description: 'Printing sensitive information'
      },
      {
        regex: /\/\/\s*TODO.*password|secret|key/gi,
        description: 'Sensitive information in comments'
      },
      {
        regex: /stackTrace|printStackTrace/gi,
        description: 'Stack trace exposure'
      }
    ],
    fix: 'Remove sensitive information from logs and error messages. Use proper logging levels.'
  }
};

/**
 * Get all rules as an array
 */
const getAllRules = () => {
  return Object.values(vulnerabilityRules);
};

/**
 * Get a specific rule by key
 */
const getRule = (key) => {
  return vulnerabilityRules[key];
};

/**
 * Get rules filtered by severity
 */
const getRulesBySeverity = (severity) => {
  return Object.values(vulnerabilityRules).filter(
    rule => rule.severity.toLowerCase() === severity.toLowerCase()
  );
};

module.exports = {
  vulnerabilityRules,
  getAllRules,
  getRule,
  getRulesBySeverity
};
