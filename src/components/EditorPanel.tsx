import React from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'motion/react';
import { FileJson, FoldVertical, UnfoldVertical, AlignLeft, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface EditorPanelProps {
  isDarkMode: boolean;
  isCollapsed: boolean;
  jsonString: string;
  setJsonString: (value: string) => void;
  editorRef: React.MutableRefObject<any>;
  handleFoldAll: () => void;
  handleUnfoldAll: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  isDarkMode,
  isCollapsed,
  jsonString,
  setJsonString,
  editorRef,
  handleFoldAll,
  handleUnfoldAll,
}) => {
  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
    } catch (e) {}
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed));
    } catch (e) {}
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isCollapsed ? 0 : '40%',
        opacity: isCollapsed ? 0 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "border-r flex flex-col overflow-hidden",
        isDarkMode ? "border-white/5" : "border-gray-900"
      )}
    >
      <div className={cn(
        "h-10 border-b flex items-center justify-between px-4 shrink-0",
        isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-900"
      )}>
        <div className="flex items-center gap-2">
          <FileJson className={cn("w-3.5 h-3.5", isDarkMode ? "text-blue-500" : "text-gray-900")} />
          <span className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>JSON Editor</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrettify}
            className={cn(
              "p-1.5 rounded transition-colors",
              isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            )}
            title="Prettify"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleMinify}
            className={cn(
              "p-1.5 rounded transition-colors",
              isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            )}
            title="Minify"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button 
            onClick={handleFoldAll}
            className={cn(
              "p-1.5 rounded transition-colors",
              isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            )}
            title="Fold All"
          >
            <FoldVertical className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleUnfoldAll}
            className={cn(
              "p-1.5 rounded transition-colors",
              isDarkMode ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            )}
            title="Unfold All"
          >
            <UnfoldVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={isDarkMode ? "vs-dark" : "light"}
          value={jsonString}
          onChange={(value) => setJsonString(value || '')}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'indentation',
          }}
        />
      </div>
    </motion.div>
  );
};

export default EditorPanel;
