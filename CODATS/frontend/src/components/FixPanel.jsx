import { useState } from 'react';
import { Sparkles, Check, Copy, RefreshCw, AlertCircle, X, Code, Lightbulb } from 'lucide-react';

const FixPanel = ({ 
  vulnerability, 
  aiAnalysis, 
  onApplyFix, 
  onClose,
  isLoadingFix 
}) => {
  const [copied, setCopied] = useState(false);

  if (!vulnerability) {
    return (
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-dark-700 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-dark-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-200 mb-2">
            AI Fix Assistant
          </h3>
          <p className="text-dark-400 text-sm max-w-xs">
            Select a vulnerability from the results panel to get AI-powered fix recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Find the AI analysis for this vulnerability
  const analysis = aiAnalysis?.find(a => a.vulnerabilityId === vulnerability.id) || {
    explanation: vulnerability.description || 'No detailed explanation available.',
    fix: vulnerability.fix || 'Please review the vulnerable code and apply security best practices.',
    confidence: 0.7
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-emerald-400 bg-emerald-500/20';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-dark-900 border-b border-dark-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Fix Assistant
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-dark-400 hover:text-dark-200 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Vulnerability Info */}
        <div className="bg-dark-900/50 rounded-lg p-4 border border-dark-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                ${vulnerability.severity === 'Critical' ? 'text-red-400 bg-red-500/20' :
                  vulnerability.severity === 'High' ? 'text-orange-400 bg-orange-500/20' :
                  vulnerability.severity === 'Medium' ? 'text-yellow-400 bg-yellow-500/20' :
                  'text-green-400 bg-green-500/20'}
              `}>
                <AlertCircle className="w-3 h-3" />
                {vulnerability.severity}
              </span>
              <h4 className="text-white font-medium mt-2">{vulnerability.type}</h4>
              <p className="text-dark-400 text-sm mt-1">Line {vulnerability.line}</p>
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(analysis.confidence)}`}>
              {getConfidenceLabel(analysis.confidence)} ({Math.round(analysis.confidence * 100)}%)
            </span>
          </div>

          {/* Vulnerable Code */}
          <div className="mt-4">
            <span className="text-xs text-dark-500 uppercase tracking-wider flex items-center gap-1">
              <Code className="w-3 h-3" />
              Vulnerable Code
            </span>
            <pre className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300 overflow-x-auto">
              <code>{vulnerability.snippet}</code>
            </pre>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="bg-dark-900/50 rounded-lg p-4 border border-dark-700">
          <h4 className="text-white font-medium flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Why This Is Dangerous
          </h4>
          <p className="text-dark-300 text-sm leading-relaxed">
            {analysis.explanation}
          </p>
        </div>

        {/* Secure Fix */}
        <div className="bg-dark-900/50 rounded-lg p-4 border border-dark-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Secure Fix
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-dark-400 hover:text-dark-200 hover:bg-dark-700 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <pre className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 overflow-x-auto whitespace-pre-wrap">
            <code>{analysis.fix}</code>
          </pre>
        </div>

        {/* Apply Fix Button */}
        <button
          onClick={() => onApplyFix(vulnerability, analysis.fix)}
          disabled={isLoadingFix}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
        >
          {isLoadingFix ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Applying Fix...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Apply Secure Fix
            </>
          )}
        </button>

        <p className="text-center text-dark-500 text-xs">
          Review the fix before applying. AI-generated fixes should be tested.
        </p>
      </div>
    </div>
  );
};

export default FixPanel;
