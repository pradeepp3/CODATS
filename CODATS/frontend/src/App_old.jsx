import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Scan, FileText, Code, Upload, X } from 'lucide-react';
import { CodeEditor, UploadBox, ResultPanel, FixPanel } from './components';
import { scanCode, scanFile } from './services/api';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [isLoadingFix, setIsLoadingFix] = useState(false);
  const [activeMode, setActiveMode] = useState('code'); // 'code' or 'upload'

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
    <div className="min-h-screen bg-slate-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #475569'
          }
        }}
      />

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CODATS</h1>
                <p className="text-sm text-slate-400">Code Analysis & Threat Scanner</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-4">
              {scanResults && (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    scanResults.vulnerabilities?.length > 0 ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-slate-300">
                    {scanResults.vulnerabilities?.length > 0 
                      ? `${scanResults.vulnerabilities.length} issues found`
                      : 'No issues found'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-8 shadow-2xl text-center max-w-sm mx-4 border border-slate-700">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-slate-600 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
              <Scan className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scanning Code</h3>
            <p className="text-slate-400">Analyzing for security vulnerabilities...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-100px)]">
          {/* Left Panel - Dynamic Content with Mode Switching */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden">
            {/* Mode Switcher */}
            <div className="border-b border-slate-700 px-4 py-2 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveMode('code')}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      activeMode === 'code'
                        ? 'bg-slate-800 text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Paste Code</span>
                  </button>
                  <button
                    onClick={() => setActiveMode('upload')}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      activeMode === 'upload'
                        ? 'bg-slate-800 text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                </div>
                
                {activeMode === 'code' && (
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !code.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{isScanning ? 'Scanning...' : 'Scan Code'}</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Dynamic Content Area */}
            <div className="h-[calc(100vh-160px)]">
              {activeMode === 'code' ? (
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  vulnerabilities={scanResults?.vulnerabilities || []}
                  onScan={handleScan}
                />
              ) : (
                <UploadBox 
                  onFileUpload={handleFileUpload}
                  isLoading={isScanning}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Scan Results */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-2 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-200">Security Analysis</span>
                </div>
                {scanResults?.riskScore !== undefined && (
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      scanResults.riskScore >= 70 
                        ? 'bg-red-900 text-red-300'
                        : scanResults.riskScore >= 40
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-green-900 text-green-300'
                    }`}>
                      Risk Score: {scanResults.riskScore}/100
                    </span>
                  </div>
                )}
                {selectedVulnerability && (
                  <button
                    onClick={handleCloseFix}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="h-[calc(100vh-160px)] overflow-y-auto">
              {selectedVulnerability ? (
                <FixPanel
                  vulnerability={selectedVulnerability}
                  aiAnalysis={scanResults?.aiAnalysis}
                  onApplyFix={handleApplyFix}
                  onClose={handleCloseFix}
                  isLoadingFix={isLoadingFix}
                />
              ) : (
                <ResultPanel
                  results={scanResults}
                  onSelectVulnerability={handleSelectVulnerability}
                  selectedVulnerability={selectedVulnerability}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
