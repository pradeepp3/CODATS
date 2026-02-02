import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const UploadBox = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.php', '.go', '.rb', '.c', '.cpp', '.cs'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return 'File too large. Maximum size is 5MB.';
    }
    
    return null;
  };

  const handleFile = useCallback((file) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Upload className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Upload File</h3>
            <p className="text-sm text-slate-400">Drag & drop or click to select</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-content flex-1 flex flex-col">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl flex-1 flex items-center justify-center text-center transition-all cursor-pointer min-h-[280px]
            ${dragActive 
              ? 'border-indigo-400 bg-indigo-500/10' 
              : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
            }
          `}
        >
          <input
            type="file"
            accept={allowedExtensions.join(',')}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center gap-6">
            <div className={`
              p-4 rounded-full transition-all
              ${dragActive 
                ? 'bg-indigo-500/20 text-indigo-400 scale-110' 
                : 'bg-slate-600/50 text-slate-400'
              }
            `}>
              <Upload className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-200">
                {dragActive ? 'Drop your file here' : 'Upload your code file'}
              </p>
              <p className="text-sm text-slate-400">
                Supports: .js, .jsx, .ts, .tsx, .py, .java, .php, .go, .rb, .c, .cpp, .cs
              </p>
              <p className="text-xs text-slate-500">
                Maximum file size: 10MB
              </p>
            </div>

            {!dragActive && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>or</span>
                <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                  click to browse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Upload Error</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Selected File */}
        {selectedFile && !error && (
          <div className="mt-6 p-4 bg-slate-700 border border-slate-600 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <File className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={clearSelection}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Load File</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
