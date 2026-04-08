import React, { useState, useEffect, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';

// Modular Imports
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import GraphPanel from './components/GraphPanel';
import Footer from './components/Footer';
import { createGraphElements } from './lib/graph-utils';
import { DEFAULT_JSON } from './constants';

function JsonTreeApp() {
  const [jsonString, setJsonString] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [isValid, setIsValid] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [history, setHistory] = useState<string[]>([]);
  const [stats, setStats] = useState({ nodes: 0, depth: 0, size: '0 B' });
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const editorWidth = 'clamp(280px, 36vw, 540px)';

  const editorRef = React.useRef<any>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Local History
  useEffect(() => {
    const saved = localStorage.getItem('baytix_jtree_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isValid) {
      const newHistory = [jsonString, ...history.filter(h => h !== jsonString)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('baytix_jtree_history', JSON.stringify(newHistory));
    }
  }, [jsonString, isValid]);

  // Stats Calculation
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString);
      let visualNodes = 0;
      let properties = 0;
      let maxDepth = 0;

      const calc = (data: any, depth: number) => {
        maxDepth = Math.max(maxDepth, depth);
        if (typeof data === 'object' && data !== null) {
          visualNodes++;
          Object.values(data).forEach(v => calc(v, depth + 1));
        } else {
          properties++;
        }
      };
      calc(parsed, 0);

      const size = new Blob([jsonString]).size;
      const sizeStr = size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} B`;

      setStats({ nodes: visualNodes, depth: maxDepth, size: sizeStr, properties });
    } catch (e) { }
  }, [jsonString]);

  const toggleNode = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const onUpdateValue = useCallback((path: string, newValue: any) => {
    setJsonString(prev => {
      try {
        const obj = JSON.parse(prev);
        // Simple path setter root.a[0].b
        const parts = path.split('.').slice(1); // remove 'root'
        let current = obj;

        for (let i = 0; i < parts.length; i++) {
          let part = parts[i];
          const arrayMatch = part.match(/(.+)\[(\d+)\]/);

          if (arrayMatch) {
            const key = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            if (i === parts.length - 1) {
              current[key][index] = newValue;
            } else {
              current = current[key][index];
            }
          } else {
            if (i === parts.length - 1) {
              current[part] = newValue;
            } else {
              current = current[part];
            }
          }
        }
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return prev;
      }
    });
  }, []);

  const onFetchUrl = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    setJsonString(JSON.stringify(data, null, 2));
  };

  const onHover = useCallback((path: string | null) => {
    setHoveredPath(path);
  }, []);

  const generateGraph = useCallback((json: any, filter: string = '', collapsed: Set<string>, direction: 'LR' | 'TB') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = createGraphElements(
      json,
      filter,
      collapsed,
      toggleNode,
      onUpdateValue,
      onHover,
      isDarkMode,
      direction
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges, toggleNode, onUpdateValue, onHover, isDarkMode]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonString);
      setIsValid(true);
      generateGraph(parsed, searchTerm, collapsedNodes, layoutDirection);
      // Small delay to ensure layout is applied before fitting view
      setTimeout(() => {
        fitView({ duration: 400, padding: 0.2 });
      }, 50);
    } catch (e: any) {
      setIsValid(false);
    }
  }, [jsonString, searchTerm, collapsedNodes, layoutDirection, generateGraph, fitView]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonString]);

  const handleResetLayout = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonString);
      generateGraph(parsed, searchTerm, collapsedNodes);
    } catch (e) { }
  }, [jsonString, searchTerm, collapsedNodes, generateGraph]);

  const handleFoldAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.foldAll').run();
    }
  }, []);

  const handleUnfoldAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.unfoldAll').run();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleDownload();
            break;
          case '/':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[placeholder="Search Node"]')?.focus();
            break;
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case 'r':
            e.preventDefault();
            handleResetLayout();
            break;
          case 'b':
            e.preventDefault();
            setIsEditorCollapsed(prev => !prev);
            break;
          case '[':
            if (e.shiftKey) {
              e.preventDefault();
              handleFoldAll();
            }
            break;
          case ']':
            if (e.shiftKey) {
              e.preventDefault();
              handleUnfoldAll();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, zoomIn, zoomOut, handleResetLayout, handleFoldAll, handleUnfoldAll]);

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-[#0a0a0c] text-gray-200" : "bg-white text-gray-900"
    )}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleDownload={handleDownload}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        handleResetLayout={handleResetLayout}
        fitView={fitView}
        isShortcutsOpen={isShortcutsOpen}
        setIsShortcutsOpen={setIsShortcutsOpen}
        layoutDirection={layoutDirection}
        setLayoutDirection={setLayoutDirection}
        onFetchUrl={onFetchUrl}
        history={history}
        onSelectHistory={setJsonString}
      />

      <main className="flex-1 flex overflow-hidden relative">
        <EditorPanel
          isDarkMode={isDarkMode}
          isCollapsed={isEditorCollapsed}
          editorWidth={editorWidth}
          jsonString={jsonString}
          setJsonString={setJsonString}
          editorRef={editorRef}
          handleFoldAll={handleFoldAll}
          handleUnfoldAll={handleUnfoldAll}
        />

        <button
          onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-[60] w-6 h-12 flex items-center justify-center rounded-r-md border border-l-0 shadow-lg transition-all",
            isDarkMode
              ? "bg-[#1a1a1e] border-white/10 text-gray-400 hover:text-white"
              : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"
          )}
          style={{
            left: isEditorCollapsed ? 0 : `calc(${editorWidth} - 1px)`
          }}
        >
          {isEditorCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <GraphPanel
          isDarkMode={isDarkMode}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />

        {hoveredPath && (
          <div className={cn(
            "absolute bottom-4 left-24 z-[100] px-3 py-1.5 rounded-lg border shadow-lg flex items-center gap-2 text-[11px] font-mono transition-all animate-in fade-in slide-in-from-bottom-2",
            isDarkMode ? "bg-[#1a1a1e] border-white/10 text-blue-400" : "bg-white border-gray-200 text-gray-900"
          )}>
            <span className="text-gray-400 font-sans uppercase text-[9px] tracking-widest font-bold mr-1">Path</span>
            {hoveredPath}
          </div>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} isValid={isValid} stats={stats} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .react-flow__handle {
          width: 6px !important;
          height: 6px !important;
          background: ${isDarkMode ? '#3b82f6' : '#111827'} !important;
          border: 1.5px solid ${isDarkMode ? '#1a1a1e' : '#fff'} !important;
          border-radius: 2px !important;
        }
        .react-flow__edge-path {
          stroke-width: 1.5 !important;
          stroke: ${isDarkMode ? '#3b82f6' : '#9ca3af'} !important;
          stroke-dasharray: ${isDarkMode ? 'none' : '4 4'} !important;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: ${isDarkMode ? '#60a5fa' : '#111827'} !important;
          stroke-dasharray: none !important;
          stroke-width: 2 !important;
        }
        .react-flow__controls-button {
          border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
          background: transparent !important;
          fill: ${isDarkMode ? '#666' : '#9ca3af'} !important;
        }
        .react-flow__controls-button:hover {
          background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
          fill: ${isDarkMode ? '#fff' : '#111827'} !important;
        }
        .react-flow__minimap {
          border-radius: 8px !important;
          overflow: hidden !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} !important;
        }
        .react-flow__minimap-viewport {
          fill: ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.05)'} !important;
          stroke: ${isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.3)'} !important;
          stroke-width: 2px !important;
        }
      `}} />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <JsonTreeApp />
    </ReactFlowProvider>
  );
}
