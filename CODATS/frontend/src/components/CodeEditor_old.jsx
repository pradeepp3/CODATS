import { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Maximize2, Minimize2 } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

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

    // Define custom dark theme with consistent blue colors
    monaco.editor.defineTheme('codats-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280' },
        { token: 'keyword', foreground: '3b82f6' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'function', foreground: 'a78bfa' },
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#334155',
        'editor.selectionBackground': '#3b82f6',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#3b82f6',
        'editorCursor.foreground': '#3b82f6',
        'editor.selectionHighlightBackground': '#3b82f640',
        'editorGutter.background': '#1e293b',
        'editorWidget.background': '#1e293b',
        'editorWidget.border': '#475569',
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

  return (
    <>
      <div className={`flex flex-col bg-slate-800 rounded-lg overflow-hidden border border-slate-700 transition-all duration-500 ease-in-out transform ${
        isExpanded 
          ? 'fixed top-4 left-4 right-4 bottom-4 z-50 shadow-2xl scale-100' 
          : 'h-full scale-100'
      }`}>
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-slate-300 text-sm font-medium">Code Editor</span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:border-blue-500 focus:outline-none cursor-pointer hover:bg-slate-600 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-slate-700">
                  {lang.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-blue-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-700"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
              lineHeight: 20,
              fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
              fontLigatures: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'line',
              padding: { top: 12, bottom: 12 },
              glyphMargin: true,
              folding: true,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              lineDecorationsWidth: 5,
              automaticLayout: true,
              wordWrap: 'on',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              theme: 'codats-dark',
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-slate-800">
                <div className="flex items-center gap-3 text-slate-400">
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
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-700 text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {code.split('\n').length} lines
            </span>
            <span>{code.length} characters</span>
            {vulnerabilities.length > 0 && (
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {vulnerabilities.length} issues
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {language.toUpperCase()}
          </div>
        </div>
      </div>
      
      {/* Expanded overlay backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default CodeEditor;
