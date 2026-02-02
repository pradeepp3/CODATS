import React, { useState } from 'react';
import { Shield, Code, Upload, Scan, AlertCircle, CheckCircle2, BarChart3, LogOut, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CodeEditor, UploadBox, ResultPanel } from '../components';
import authService from '../services/authService';

const Detector = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' or 'editor'

  const handleFileUpload = async (file, content) => {
    try {
      setCode(content);
      setMode('editor');
      toast.success(`${file.name} loaded successfully`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to load file');
    }
  };

  const handleScan = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to scan');
      return;
    }

    setIsScanning(true);
    try {
      const response = await authService.scanCode(code);
      setScanResults(response);
      toast.success(`Scan completed - ${response.vulnerabilities?.length || 0} vulnerabilities found`);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Scan failed. Please try again.');
      setScanResults(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyFix = async (vulnerability) => {
    try {
      const response = await authService.applyFix(code, vulnerability);
      if (response.fixedCode) {
        setCode(response.fixedCode);
        toast.success('Fix applied successfully');
        // Re-scan after applying fix
        handleScan();
      }
    } catch (error) {
      console.error('Fix error:', error);
      toast.error('Failed to apply fix');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getVulnerabilityStats = () => {
    if (!scanResults?.vulnerabilities) return { high: 0, medium: 0, low: 0 };
    
    return scanResults.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity?.toLowerCase() || 'low']++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
  };

  const stats = getVulnerabilityStats();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">{/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    CODATS
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">Welcome, {user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md text-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex-1 flex flex-col min-h-0">{/* Stats Cards */}
        {scanResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-400">Total Issues</p>
                  <p className="text-2xl font-bold text-white">{scanResults.vulnerabilities?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">{stats.high}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-400">Medium Risk</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.medium}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-400">Low Risk</p>
                  <p className="text-2xl font-bold text-green-400">{stats.low}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setMode('editor')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'editor'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Code Editor
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">{/* Left Column */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 min-h-0">{mode === 'upload' ? (
                <div className="bg-slate-800 rounded-lg p-6 h-full">
                  <UploadBox onFileUpload={handleFileUpload} />
                </div>
              ) : (
                <CodeEditor 
                  code={code} 
                  onChange={setCode}
                  language="javascript"
                />
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-800 rounded-lg p-6 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Scan Results</h2>
                <button
                  onClick={handleScan}
                  disabled={isScanning || !code.trim()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isScanning || !code.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      <span>Scan Code</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex-1 min-h-0">
                <ResultPanel
                  results={scanResults}
                  onApplyFix={handleApplyFix}
                  isLoading={isScanning}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Detector;