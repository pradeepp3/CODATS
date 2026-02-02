import { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Maximize2, Minimize2 } from 'lucide-react';

const CodeEditor = ({ 
  code, 
  onChange, 
  vulnerabilities = [] 
}) => {
  const editorRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState('javascript');

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
    
    // Configure dark theme for Monaco
    monaco.editor.defineTheme('codatsDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'e2e8f0' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '3b82f6' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'function', foreground: '8b5cf6' },
        { token: 'variable', foreground: 'f472b6' },
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#334155',
        'editor.selectionBackground': '#475569',
        'editorLineNumber.foreground': '#64748b',
        'editorGutter.background': '#1e293b',
        'editorCursor.foreground': '#3b82f6',
        'editor.selectionHighlightBackground': '#475569',
        'editorBracketMatch.background': '#475569',
        'editorBracketMatch.border': '#64748b',
      },
    });
    
    monaco.editor.setTheme('codatsDark');
  };

  const editorOptions = {
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: 'Monaco, Menlo, "SF Mono", "Roboto Mono", monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    renderLineHighlight: 'line',
    selectOnLineNumbers: true,
    roundedSelection: true,
    readOnly: false,
    cursorStyle: 'line',
    contextmenu: true,
    mouseWheelZoom: true,
    padding: { top: 16, bottom: 16 },
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${isExpanded ? 'fixed inset-4 z-50' : 'h-full'} flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden`}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Code className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Code Editor</h3>
            <p className="text-sm text-slate-400">Write or paste your code here</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-select text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          {/* Expand/Minimize Button */}
          <button
            onClick={toggleExpanded}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
          theme="codatsDark"
        />
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 border-t border-slate-700 px-4 py-2 bg-slate-900 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 capitalize">{language}</span>
          {vulnerabilities.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-400 font-medium">
                {vulnerabilities.length} issue{vulnerabilities.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
        <div className="text-slate-500">
          {code ? code.split('\n').length : 0} lines • {code ? code.length : 0} chars
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;