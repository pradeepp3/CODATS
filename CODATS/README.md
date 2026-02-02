# CODATS - Code Analysis & Threat Scanning System

<div align="center">
  <img src="frontend/public/shield.svg" alt="CODATS Logo" width="80" height="80">
  
  **A powerful security vulnerability scanner for source code**
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 🛡️ Overview

CODATS (Code Analysis & Threat Scanning System) is a comprehensive security scanning tool that analyzes source code for potential vulnerabilities. It uses rule-based pattern matching combined with AI-powered analysis (Gemini/Groq) to detect security issues and provide fix recommendations.

## ✨ Features

- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, PHP, Go, Ruby, C/C++, C#
- **Vulnerability Detection**:
  - SQL Injection
  - Cross-Site Scripting (XSS)
  - Hardcoded Credentials & API Keys
  - Command Injection
  - Unsafe Functions (eval, exec, etc.)
  - Path Traversal
  - Insecure Cryptography
  - Configuration Issues
  - Information Disclosure
- **Monaco Editor Integration**: Professional code editor with syntax highlighting
- **Real-time Analysis**: Instant vulnerability detection and highlighting
- **AI-Powered Fixes**: Intelligent fix recommendations with confidence scores
- **Risk Scoring**: Overall security risk assessment (0-100)
- **File Upload**: Drag & drop file scanning support

## 🖼️ Screenshots

The application features:
- Left panel: Monaco Code Editor with vulnerability highlighting
- Right panel: Scan results with severity indicators
- AI Fix Assistant: Click any vulnerability for secure fix recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) Gemini API Key or Groq API Key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codats.git
   cd codats
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add your API key (optional but recommended)
   # GEMINI_API_KEY=your_gemini_api_key_here
   # or
   # GROQ_API_KEY=your_groq_api_key_here
   # AI_PROVIDER=gemini  # or "groq"
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the Backend Server**
   ```bash
   cd ../backend
   npm start
   # Server runs on http://localhost:5000
   ```

6. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:3000
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
CODATS/
├── backend/
│   ├── ai/
│   │   └── gemini.js       # AI integration (Gemini/Groq)
│   ├── uploads/            # Temporary file uploads
│   ├── .env                # Environment variables
│   ├── .env.example        # Example env file
│   ├── package.json        # Backend dependencies
│   ├── rules.js            # Vulnerability detection rules
│   ├── scanner.js          # Code scanning engine
│   └── server.js           # Express server
│
├── frontend/
│   ├── public/
│   │   └── shield.svg      # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx    # Monaco editor component
│   │   │   ├── FixPanel.jsx      # AI fix panel
│   │   │   ├── ResultPanel.jsx   # Scan results display
│   │   │   ├── UploadBox.jsx     # File upload component
│   │   │   └── index.js          # Component exports
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx               # Main application
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

## 🔧 API Endpoints

### Scan Code
```http
POST /api/scan
Content-Type: application/json

{
  "code": "your source code here",
  "language": "javascript"
}
```

### Upload and Scan File
```http
POST /api/scan/upload
Content-Type: multipart/form-data

file: <your-file>
```

### Get AI Fix
```http
POST /api/fix
Content-Type: application/json

{
  "vulnerability": { ... },
  "code": "original code"
}
```

### Get Supported Languages
```http
GET /api/languages
```

### Get Vulnerability Rules
```http
GET /api/rules
```

### Health Check
```http
GET /api/health
```

## 🔐 Vulnerability Detection Rules

| Vulnerability Type | Severity | Description |
|-------------------|----------|-------------|
| SQL Injection | Critical | String concatenation in SQL queries |
| Command Injection | Critical | Unsanitized input in system commands |
| Hardcoded Credentials | High | Passwords, API keys in source code |
| XSS | High | innerHTML, document.write usage |
| Unsafe Functions | High | eval(), exec(), unserialize() |
| Path Traversal | High | File operations with user input |
| Insecure Crypto | Medium | MD5, SHA1, weak encryption |
| Insecure Config | Medium | Debug mode, disabled SSL |
| Info Disclosure | Low | Logging sensitive data |

## 🤖 AI Integration

CODATS supports two AI providers for generating fix recommendations:

### Gemini (Google)
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `GEMINI_API_KEY` in `.env`
3. Set `AI_PROVIDER=gemini`

### Groq
1. Get an API key from [Groq Console](https://console.groq.com/keys)
2. Set `GROQ_API_KEY` in `.env`
3. Set `AI_PROVIDER=groq`

**Note**: If no API key is configured, CODATS will use built-in fallback analysis.

## 🎨 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **CORS** - Cross-origin support
- **dotenv** - Environment configuration
- **Axios** - HTTP client for AI APIs

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - API client

## 📝 Usage Examples

### Scan JavaScript Code
```javascript
// This code will be flagged for SQL Injection
const query = "SELECT * FROM users WHERE id = " + req.query.id;
db.query(query);
```

### Scan Python Code
```python
# This code will be flagged for Command Injection
import os
user_input = input("Enter filename: ")
os.system("cat " + user_input)
```

## 🛠️ Development

### Run Backend in Development Mode
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- Google Gemini and Groq for AI capabilities

---

<div align="center">
  Made with ❤️ for secure code
</div>
