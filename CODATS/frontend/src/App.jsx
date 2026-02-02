import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Github, Menu, X, Zap, Lock, Eye, Code2 } from 'lucide-react';
import { CodeEditor, UploadBox, ResultPanel, FixPanel } from './components';
import { scanCode, scanFile } from './services/api';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [isLoadingFix, setIsLoadingFix] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to scan');
      return;
    }

    setIsScanning(true);
    setSelectedVulnerability(null);
    setScanResults(null);

    try {
      const results = await scanCode(code, language);
      setScanResults(results);
      
      if (results.vulnerabilities?.length > 0) {
        toast.error(`Found ${results.vulnerabilities.length} security issues!`, {
          icon: '⚠️',
          duration: 4000
        });
      } else {
        toast.success('No vulnerabilities detected!', {
          icon: '🛡️',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.error || 'Failed to scan code. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [code, language]);

  const handleFileUpload = useCallback(async (file) => {
    setIsScanning(true);
    setSelectedVulnerability(null);
    setScanResults(null);

    try {
      const results = await scanFile(file);
      setScanResults(results);
      
      // Read file content and update editor
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);

      // Detect language from file extension
      const ext = file.name.split('.').pop().toLowerCase();
      const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'php': 'php',
        'go': 'go',
        'rb': 'ruby'
      };
      setLanguage(langMap[ext] || 'javascript');

      if (results.vulnerabilities?.length > 0) {
        toast.error(`Found ${results.vulnerabilities.length} security issues in ${file.name}!`, {
          icon: '⚠️',
          duration: 4000
        });
      } else {
        toast.success('No vulnerabilities detected!', {
          icon: '🛡️',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('File scan error:', error);
      toast.error(error.error || 'Failed to scan file. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleSelectVulnerability = useCallback((vuln) => {
    setSelectedVulnerability(vuln);
  }, []);

  const handleApplyFix = useCallback((vulnerability, fix) => {
    if (!fix || !vulnerability) return;

    setIsLoadingFix(true);

    try {
      const lines = code.split('\n');
      const lineIndex = vulnerability.line - 1;
      
      // Replace the vulnerable line with the fix
      // For multi-line fixes, we'll replace just the vulnerable line
      const fixLines = fix.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      const mainFix = fixLines[0] || lines[lineIndex];
      
      lines[lineIndex] = mainFix;
      
      setCode(lines.join('\n'));
      
      // Remove the fixed vulnerability from results
      if (scanResults) {
        const updatedVulns = scanResults.vulnerabilities.filter(v => v.id !== vulnerability.id);
        const updatedAiAnalysis = scanResults.aiAnalysis?.filter(a => a.vulnerabilityId !== vulnerability.id) || [];
        
        setScanResults({
          ...scanResults,
          vulnerabilities: updatedVulns,
          aiAnalysis: updatedAiAnalysis,
          totalVulnerabilities: updatedVulns.length
        });
      }

      setSelectedVulnerability(null);
      toast.success('Fix applied successfully!', {
        icon: '✅',
        duration: 3000
      });
    } catch (error) {
      console.error('Apply fix error:', error);
      toast.error('Failed to apply fix. Please try manually.');
    } finally {
      setIsLoadingFix(false);
    }
  }, [code, scanResults]);

  const handleCloseFix = useCallback(() => {
    setSelectedVulnerability(null);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 4000
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-lg border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CODATS</h1>
                <p className="text-xs text-dark-400 hidden sm:block">Code Analysis & Threat Scanner</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-dark-300 hover:text-white transition-colors text-sm">Features</a>
              <a href="#demo" className="text-dark-300 hover:text-white transition-colors text-sm">Demo</a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-dark-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-dark-700">
            <nav className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-dark-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="block text-dark-300 hover:text-white transition-colors">Demo</a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Security Analysis
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Detect Security Vulnerabilities
            <br />
            <span className="gradient-text">Before They Become Threats</span>
          </h1>
          
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            CODATS scans your source code for security vulnerabilities using advanced 
            rule-based analysis and AI-powered fix recommendations.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-dark-200 text-sm">
              <Lock className="w-4 h-4 text-red-400" />
              SQL Injection
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-dark-200 text-sm">
              <Code2 className="w-4 h-4 text-orange-400" />
              XSS Detection
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-dark-200 text-sm">
              <Eye className="w-4 h-4 text-yellow-400" />
              Hardcoded Secrets
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-full text-dark-200 text-sm">
              <Shield className="w-4 h-4 text-purple-400" />
              Command Injection
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 shadow-2xl text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scanning Code...</h3>
              <p className="text-dark-400">Analyzing for security vulnerabilities</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Editor */}
          <div className="space-y-6">
            <div className="h-[600px]">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                vulnerabilities={scanResults?.vulnerabilities || []}
                onScan={handleScan}
              />
            </div>
            
            <UploadBox 
              onFileUpload={handleFileUpload}
              isLoading={isScanning}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <ResultPanel
              results={scanResults}
              onSelectVulnerability={handleSelectVulnerability}
              selectedVulnerability={selectedVulnerability}
            />
            
            <FixPanel
              vulnerability={selectedVulnerability}
              aiAnalysis={scanResults?.aiAnalysis}
              onApplyFix={handleApplyFix}
              onClose={handleCloseFix}
              isLoadingFix={isLoadingFix}
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-800/50 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Security Features</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Comprehensive vulnerability detection for multiple programming languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-red-500/20 rounded-xl w-fit mb-4">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">SQL Injection Detection</h3>
              <p className="text-dark-400 text-sm">
                Identifies SQL injection vulnerabilities from string concatenation and template literals in database queries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
                <Code2 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">XSS Prevention</h3>
              <p className="text-dark-400 text-sm">
                Detects cross-site scripting vulnerabilities from innerHTML, document.write, and unsafe DOM manipulation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-yellow-500/20 rounded-xl w-fit mb-4">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secret Detection</h3>
              <p className="text-dark-400 text-sm">
                Finds hardcoded passwords, API keys, tokens, and connection strings that should be in environment variables.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Command Injection</h3>
              <p className="text-dark-400 text-sm">
                Identifies dangerous system command execution patterns that could allow arbitrary command execution.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-primary-500/20 rounded-xl w-fit mb-4">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Fixes</h3>
              <p className="text-dark-400 text-sm">
                Get intelligent fix recommendations powered by Gemini/Groq AI with confidence scores and explanations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 card-hover">
              <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4">
                <Github className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Language Support</h3>
              <p className="text-dark-400 text-sm">
                Supports JavaScript, TypeScript, Python, Java, PHP, Go, Ruby, and more programming languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-dark-300 font-medium">CODATS</span>
            </div>
            
            <p className="text-dark-500 text-sm">
              © 2026 CODATS. Code Analysis & Threat Scanning System.
            </p>

            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
