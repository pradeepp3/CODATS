import { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ 
  code, 
  setCode, 
  language, 
  setLanguage, 
  vulnerabilities = [],
  onScan 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [decorations, setDecorations] = useState([]);

  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'php', name: 'PHP' },
    { id: 'go', name: 'Go' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'c', name: 'C' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
  ];

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme
    monaco.editor.defineTheme('codats-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#334155',
        'editor.selectionBackground': '#475569',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#e2e8f0',
        'editorCursor.foreground': '#0ea5e9',
        'editor.selectionHighlightBackground': '#0ea5e933',
      },
    });

    monaco.editor.setTheme('codats-dark');
  };

  // Update decorations when vulnerabilities change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const monaco = monacoRef.current;
    const editor = editorRef.current;

    // Create new decorations for vulnerable lines
    const newDecorations = vulnerabilities.map(vuln => ({
      range: new monaco.Range(vuln.line, 1, vuln.line, 1),
      options: {
        isWholeLine: true,
        className: 'vulnerability-line',
        glyphMarginClassName: 'vulnerability-line-glyph',
        hoverMessage: {
          value: `**${vuln.type}** (${vuln.severity})\n\n${vuln.description}\n\n_Line ${vuln.line}: ${vuln.snippet}_`
        },
        glyphMarginHoverMessage: {
          value: `⚠️ ${vuln.type} - ${vuln.severity}`
        },
        overviewRuler: {
          color: vuln.severity === 'Critical' ? '#dc2626' : 
                 vuln.severity === 'High' ? '#ea580c' : 
                 vuln.severity === 'Medium' ? '#d97706' : '#65a30d',
          position: monaco.editor.OverviewRulerLane.Right
        }
      }
    }));

    // Apply decorations
    const ids = editor.deltaDecorations(decorations, newDecorations);
    setDecorations(ids);
  }, [vulnerabilities]);

  const handleEditorChange = useCallback((value) => {
    setCode(value || '');
  }, [setCode]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Sample vulnerable code for demonstration
  const sampleCodes = {
    javascript: `// Example JavaScript code with security vulnerabilities
const express = require('express');
const app = express();

// SQL Injection vulnerability
app.get('/user', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id;
  db.query(query);
});

// XSS vulnerability
app.get('/display', (req, res) => {
  document.innerHTML = req.query.name;
});

// Hardcoded credentials
const password = "admin123";
const apiKey = "sk-1234567890abcdef";

// Command injection
const { exec } = require('child_process');
exec('ls ' + userInput);

// Unsafe eval
eval(userInput);

// Weak cryptography
const hash = crypto.createHash('md5').update(password).digest('hex');
`,
    python: `# Example Python code with security vulnerabilities
import os
import sqlite3
import pickle

# SQL Injection vulnerability
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)

# Command Injection
user_input = input("Enter filename: ")
os.system("cat " + user_input)

# Hardcoded credentials
password = "secret123"
api_key = "sk-abcdefghijklmnop"

# Unsafe pickle deserialization
data = pickle.loads(user_data)

# Weak hash
import hashlib
hash = hashlib.md5(password.encode()).hexdigest()
`,
    java: `// Example Java code with security vulnerabilities
import java.sql.*;
import java.io.*;

public class VulnerableCode {
    // SQL Injection
    public void getUser(String userId) {
        String query = "SELECT * FROM users WHERE id = " + userId;
        statement.executeQuery(query);
    }
    
    // Command Injection
    public void runCommand(String userInput) {
        Runtime.getRuntime().exec("cmd /c " + userInput);
    }
    
    // Hardcoded password
    private String password = "admin123";
    
    // Weak cryptography
    MessageDigest md = MessageDigest.getInstance("MD5");
}
`,
    php: `<?php
// Example PHP code with security vulnerabilities

// SQL Injection
$user_id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $user_id;
mysqli_query($conn, $query);

// XSS vulnerability
echo $_GET['name'];

// Command Injection
$filename = $_POST['file'];
system("cat " . $filename);

// Hardcoded credentials
$password = "secret123";
$api_key = "sk-1234567890";

// File inclusion
include($_GET['page']);
?>`
  };

  const loadSampleCode = () => {
    const sample = sampleCodes[language] || sampleCodes.javascript;
    setCode(sample);
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 rounded-xl overflow-hidden border border-dark-700">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-900 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-dark-400 text-sm font-medium">Code Editor</span>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-dark-700 text-dark-200 text-sm rounded-lg px-3 py-1.5 border border-dark-600 focus:border-primary-500 focus:outline-none cursor-pointer hover:bg-dark-600 transition-colors"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadSampleCode}
            className="text-sm text-dark-400 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-dark-700"
          >
            Load Sample
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true, scale: 0.75 },
            fontSize: 14,
            lineHeight: 22,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            padding: { top: 16, bottom: 16 },
            glyphMargin: true,
            folding: true,
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            automaticLayout: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-dark-800">
              <div className="flex items-center gap-3 text-dark-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-900 border-t border-dark-700 text-sm">
        <div className="flex items-center gap-4 text-dark-400">
          <span>{code.split('\n').length} lines</span>
          <span>{code.length} characters</span>
        </div>
        
        <button
          onClick={onScan}
          disabled={!code.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium text-sm hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Scan for Vulnerabilities
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
