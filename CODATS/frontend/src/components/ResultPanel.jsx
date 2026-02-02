import { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Wrench,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';

const ResultPanel = ({ results, isScanning, onApplyFix }) => {
  const [expandedVulns, setExpandedVulns] = useState(new Set());

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedVulns);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedVulns(newExpanded);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'high':
        return {
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'severity-high',
          icon: AlertTriangle,
          iconColor: 'text-red-500'
        };
      case 'medium':
        return {
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'severity-medium',
          icon: AlertCircle,
          iconColor: 'text-amber-500'
        };
      case 'low':
        return {
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'severity-low',
          icon: AlertCircle,
          iconColor: 'text-green-500'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'severity-low',
          icon: AlertCircle,
          iconColor: 'text-gray-500'
        };
    }
  };

  const getRiskScore = () => {
    if (!results?.vulnerabilities?.length) return 0;
    
    const severityWeights = { high: 10, medium: 5, low: 1 };
    const totalScore = results.vulnerabilities.reduce((acc, vuln) => {
      return acc + (severityWeights[vuln.severity] || 1);
    }, 0);
    
    return Math.min(100, Math.round((totalScore / results.vulnerabilities.length) * 10));
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (score >= 60) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (score >= 40) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (score >= 20) return { level: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Minimal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (isScanning) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-full">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Scanning Code</h3>
              <p className="text-sm text-slate-400">Analyzing for security vulnerabilities...</p>
            </div>
          </div>
        </div>
        
        <div className="card-content flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4 border-slate-300 border-t-indigo-500"></div>
            <p className="text-slate-300">Scanning in progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-full">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600/50 rounded-lg">
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Scan Results</h3>
              <p className="text-sm text-slate-400">Security analysis results will appear here</p>
            </div>
          </div>
        </div>
        
        <div className="empty-state h-64">
          <div className="empty-state-icon">
            <Shield className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Ready to scan</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Upload a file or write code in the editor, then click "Start Security Scan" to begin analysis.
          </p>
        </div>
      </div>
    );
  }

  const riskScore = getRiskScore();
  const riskInfo = getRiskLevel(riskScore);
  const vulnerabilities = results.vulnerabilities || [];
  const totalVulns = vulnerabilities.length;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Scan Results</h3>
            <p className="text-sm text-slate-400">Security analysis complete</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Risk Score Card */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            {/* Risk Score */}
            <div className="text-center p-4 bg-slate-700 rounded-xl">
              <div className="text-3xl font-bold text-slate-100 mb-1">{riskScore}</div>
              <div className="text-sm text-slate-400 mb-2">Risk Score</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${riskInfo.color} ${riskInfo.bg}`}>
                {riskInfo.level}
              </div>
            </div>
            
            {/* Vulnerabilities Count */}
            <div className="text-center p-4 bg-slate-700 rounded-xl">
              <div className="text-3xl font-bold text-slate-100 mb-1">{totalVulns}</div>
              <div className="text-sm text-slate-400 mb-2">
                Issue{totalVulns !== 1 ? 's' : ''} Found
              </div>
              <div className="flex justify-center gap-1">
                {['high', 'medium', 'low'].map(severity => {
                  const count = vulnerabilities.filter(v => v.severity === severity).length;
                  if (count === 0) return null;
                  return (
                    <span key={severity} className={getSeverityConfig(severity).badge}>
                      {count} {severity}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerabilities List */}
        <div className="flex-1 overflow-y-auto">
          {totalVulns === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="empty-state-title text-green-700">No vulnerabilities found!</h3>
              <p className="empty-state-description">
                Your code appears to be secure. Great job following security best practices!
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {vulnerabilities.map((vuln, index) => {
                const config = getSeverityConfig(vuln.severity);
                const isExpanded = expandedVulns.has(index);
                const IconComponent = config.icon;

                return (
                  <div 
                    key={index} 
                    className={`border rounded-lg transition-all ${config.border} ${config.bg}`}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleExpanded(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold truncate ${config.color}`}>
                                {vuln.name || `Security Issue ${index + 1}`}
                              </h4>
                              <span className={config.badge}>
                                {vuln.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {vuln.line && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>Line {vuln.line}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Impact: {vuln.severity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyFix && onApplyFix(vuln);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Wrench className="w-3 h-3" />
                            Fix
                          </button>
                          
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="pt-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                          <p className="text-sm text-gray-600 mb-3">
                            {vuln.description || 'No description available for this vulnerability.'}
                          </p>
                          
                          {vuln.recommendation && (
                            <>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendation</h5>
                              <p className="text-sm text-gray-600">
                                {vuln.recommendation}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;