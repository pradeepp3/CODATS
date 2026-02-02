import { AlertTriangle, AlertCircle, Info, Shield, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { useState } from 'react';

const ResultPanel = ({ results, onSelectVulnerability, selectedVulnerability }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <div className="p-6 bg-slate-700/50 rounded-full mb-6">
          <Shield className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200 mb-3">
          No Scan Results Yet
        </h3>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Paste code into the editor or upload a file, then click "Scan Code" to analyze.
        </p>
      </div>
    );
  }

  const { vulnerabilities, riskScore, summary } = results;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'High':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-green-400';
    return 'text-emerald-400';
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Secure';
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Risk Score Card */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-300 text-sm font-medium">Overall Risk Score</span>
            <span className={`text-sm font-medium ${getRiskColor(riskScore)}`}>
              {getRiskLevel(riskScore)}
            </span>
          </div>
          
          {/* Risk Meter */}
          <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${riskScore}%`,
                background: riskScore >= 80 ? 'linear-gradient(90deg, #dc2626, #ef4444)' :
                           riskScore >= 60 ? 'linear-gradient(90deg, #ea580c, #f97316)' :
                           riskScore >= 40 ? 'linear-gradient(90deg, #d97706, #eab308)' :
                           riskScore >= 20 ? 'linear-gradient(90deg, #65a30d, #84cc16)' :
                           'linear-gradient(90deg, #059669, #10b981)'
              }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>0</span>
            <span className={`font-bold text-base ${getRiskColor(riskScore)}`}>{riskScore}</span>
            <span>100</span>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(summary.bySeverity).map(([severity, count]) => (
              <div 
                key={severity}
                className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600"
              >
                <div className={`text-xl font-bold ${
                  severity === 'Critical' ? 'text-red-400' :
                  severity === 'High' ? 'text-orange-400' :
                  severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {count}
                </div>
                <div className="text-xs text-slate-400 mt-1">{severity}</div>
              </div>
            ))}
          </div>
        )}

        {/* Vulnerabilities List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Detected Vulnerabilities ({vulnerabilities.length})
          </h4>

          {vulnerabilities.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Shield className="w-5 h-5" />
                <span className="font-medium">No vulnerabilities detected!</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Your code appears to be secure.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {vulnerabilities.map((vuln) => (
                <div
                  key={vuln.id}
                  className={`
                    bg-slate-700/30 rounded-lg border transition-all cursor-pointer
                    ${selectedVulnerability?.id === vuln.id 
                      ? 'border-blue-500 ring-1 ring-blue-500/50' 
                      : 'border-slate-600 hover:border-slate-500'
                    }
                  `}
                  onClick={() => onSelectVulnerability(vuln)}
                >
                  {/* Vulnerability Header */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`
                          flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border
                          ${getSeverityColor(vuln.severity)}
                        `}>
                          {getSeverityIcon(vuln.severity)}
                          {vuln.severity}
                        </span>
                        <span className="text-slate-200 font-medium text-sm">
                          {vuln.type}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(vuln.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded transition-colors"
                      >
                        {expandedItems[vuln.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        Line {vuln.line}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span>{vuln.description}</span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems[vuln.id] && (
                    <div className="px-3 pb-3 border-t border-slate-600 pt-3">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">
                            Vulnerable Code
                          </span>
                          <pre className="mt-1 p-2 bg-slate-800 rounded text-xs text-red-300 overflow-x-auto border border-slate-600">
                            <code>{vuln.snippet}</code>
                          </pre>
                        </div>
                        
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider">
                            Recommendation
                          </span>
                          <p className="mt-1 text-sm text-slate-300">
                            {vuln.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;
