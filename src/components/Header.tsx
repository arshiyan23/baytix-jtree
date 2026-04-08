import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Minus, 
  Maximize, 
  Sun, 
  Moon, 
  RefreshCcw,
  Layout,
  Image as ImageIcon,
  Globe,
  Loader2,
  History
} from 'lucide-react';
import { cn } from '../lib/utils';
import ShortcutsMenu from './ShortcutsMenu';
import { toPng } from 'html-to-image';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleDownload: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  handleResetLayout: () => void;
  fitView: () => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (isOpen: boolean) => void;
  layoutDirection: 'LR' | 'TB';
  setLayoutDirection: (dir: 'LR' | 'TB') => void;
  onFetchUrl: (url: string) => Promise<void>;
  history: string[];
  onSelectHistory: (json: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  searchTerm,
  setSearchTerm,
  handleDownload,
  zoomIn,
  zoomOut,
  handleResetLayout,
  fitView,
  isShortcutsOpen,
  setIsShortcutsOpen,
  layoutDirection,
  setLayoutDirection,
  onFetchUrl,
  history,
  onSelectHistory,
}) => {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleExportImage = async () => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (el) {
      const dataUrl = await toPng(el, { backgroundColor: isDarkMode ? '#0a0a0c' : '#f9fafb' });
      const link = document.createElement('a');
      link.download = 'baytix-jtree.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsFetching(true);
    try {
      await onFetchUrl(url);
      setUrl('');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <header className={cn(
      "h-14 border-b flex items-center justify-between px-4 sticky top-0 z-50 transition-colors",
      isDarkMode ? "bg-[#0d0d0f] border-white/5" : "bg-white border-gray-900"
    )}>
      <div className="flex items-center gap-3">
        <img 
          src="/assets/logo-full.png" 
          alt="JTree Logo" 
          className={cn(
            "h-8 w-auto object-contain transition-all duration-300",
            isDarkMode && "invert brightness-0 invert"
          )}
        />
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl px-4">
        <form onSubmit={handleFetch} className="relative flex-1 group">
          <Globe className={cn(
            "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isDarkMode ? "text-gray-500 group-focus-within:text-blue-500" : "text-gray-300 group-focus-within:text-gray-900"
          )} />
          <input 
            type="text" 
            placeholder="Fetch JSON from URL" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "pl-9 pr-10 py-1.5 text-xs rounded-lg border transition-all w-full outline-none",
              isDarkMode 
                ? "bg-white/5 border-white/5 text-white focus:ring-2 focus:ring-blue-500/50" 
                : "bg-white border-gray-200 text-gray-900 focus:border-gray-900"
            )}
          />
          <button 
            type="submit"
            disabled={isFetching}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </form>

        <div className="relative group flex-1">
          <Search className={cn(
            "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isDarkMode ? "text-gray-500 group-focus-within:text-blue-500" : "text-gray-300 group-focus-within:text-gray-900"
          )} />
          <input 
            type="text" 
            placeholder="Search Node" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-9 pr-4 py-1.5 text-xs rounded-lg border transition-all w-full outline-none",
              isDarkMode 
                ? "bg-white/5 border-white/5 text-white focus:ring-2 focus:ring-blue-500/50" 
                : "bg-white border-gray-200 text-gray-900 focus:border-gray-900"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 mr-2">
          <button 
            onClick={() => setLayoutDirection(layoutDirection === 'LR' ? 'TB' : 'LR')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title={`Switch to ${layoutDirection === 'LR' ? 'Vertical' : 'Horizontal'} Layout`}
          >
            <Layout className={cn("w-4 h-4", layoutDirection === 'TB' && "rotate-90")} />
          </button>
          <button 
            onClick={handleExportImage}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Export as Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-white/10 mx-1" />
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleDownload} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Download JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={zoomIn} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={zoomOut} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleResetLayout} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Reset Layout"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900",
                isHistoryOpen && (isDarkMode ? "bg-white/10 text-white" : "bg-gray-200 text-gray-900")
              )} 
              title="Local History"
            >
              <History className="w-4 h-4" />
            </button>
            
            {isHistoryOpen && (
              <div className={cn(
                "absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95",
                isDarkMode ? "bg-[#1a1a1e] border-white/10" : "bg-white border-gray-200"
              )}>
                <div className="px-4 py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Recent History
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500 italic">No history yet</div>
                  ) : (
                    history.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectHistory(h);
                          setIsHistoryOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-xs truncate transition-colors",
                          isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {h.substring(0, 50)}...
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={fitView} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title="Fit View"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-50 text-gray-400 hover:text-gray-900"
            )} 
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <ShortcutsMenu 
          isOpen={isShortcutsOpen} 
          setIsOpen={setIsShortcutsOpen} 
          isDarkMode={isDarkMode} 
        />
      </div>
    </header>
  );
};

export default Header;
