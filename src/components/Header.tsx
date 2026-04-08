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
  History,
  Keyboard,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import ShortcutsMenu from './ShortcutsMenu';
import { toSvg } from 'html-to-image';

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
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const runWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
      }),
    ]);
  };

  const handleExportImage = async () => {
    if (isExportingImage) return;

    setIsExportingImage(true);

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));

      const paneEl = document.querySelector('.react-flow') as HTMLElement | null;
      const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement | null;

      if (!paneEl || !viewportEl) {
        throw new Error('Could not find graph container');
      }

      const rect = paneEl.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      const svgDataUrl = await runWithTimeout(
        toSvg(viewportEl, {
          backgroundColor: isDarkMode ? '#0a0a0c' : '#f9fafb',
          width,
          height,
          cacheBust: true,
        }),
        15000
      );

      const response = await fetch(svgDataUrl);
      const svgBlob = await response.blob();

      const link = document.createElement('a');
      link.download = 'baytix-jtree.svg';
      link.href = URL.createObjectURL(svgBlob);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      console.error('Failed to export image:', error);
      const isTimeout = error instanceof Error && error.message === 'timeout';
      window.alert(
        isTimeout
          ? 'Export took too long. Try collapsing nodes and export again.'
          : 'Could not export image. Please try again.'
      );
    } finally {
      setIsExportingImage(false);
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
      "border-b sticky top-0 z-50 transition-colors",
      isDarkMode ? "bg-[#0d0d0f] border-white/5" : "bg-white border-gray-900"
    )}>
      <div className="h-14 px-4 flex items-center justify-between">
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

        <div className="hidden xl:flex items-center gap-4 flex-1 justify-center max-w-2xl px-4">
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

        <div className="hidden xl:flex items-center gap-1">
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
            disabled={isExportingImage}
            className={cn(
              "p-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            )} 
            title={isExportingImage ? "Exporting Image..." : "Export as Image"}
          >
            {isExportingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
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

        <div className="hidden md:flex xl:hidden items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            )}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            )}
            title="Open tools"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            )}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-gray-500 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            )}
            title="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className={cn(
        "xl:hidden border-t px-4 py-2",
        isDarkMode ? "border-white/10" : "border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={cn(
              "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )} />
            <input
              type="text"
              placeholder="Search Node"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-9 pr-4 py-2 text-xs rounded-lg border transition-all w-full outline-none",
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-500/50"
                  : "bg-white border-gray-200 text-gray-900 focus:border-gray-900"
              )}
            />
          </div>
          <button
            onClick={fitView}
            className={cn(
              "p-2 rounded-lg transition-colors shrink-0",
              isDarkMode ? "bg-white/5 text-gray-300 hover:text-white" : "bg-gray-100 text-gray-700 hover:text-gray-900"
            )}
            title="Reset Zoom"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetLayout}
            className={cn(
              "p-2 rounded-lg transition-colors shrink-0",
              isDarkMode ? "bg-white/5 text-gray-300 hover:text-white" : "bg-gray-100 text-gray-700 hover:text-gray-900"
            )}
            title="Reset Nodes"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={cn(
          "xl:hidden border-t px-4 py-3 space-y-3",
          isDarkMode ? "border-white/10 bg-[#0d0d0f]" : "border-gray-200 bg-white"
        )}>
          <form onSubmit={handleFetch} className="relative">
            <Globe className={cn(
              "w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )} />
            <input
              type="text"
              placeholder="Fetch JSON from URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={cn(
                "pl-9 pr-10 py-2 text-xs rounded-lg border transition-all w-full outline-none",
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-500/50"
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

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <button onClick={zoomIn} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Zoom In"><Plus className="w-4 h-4 mx-auto" /></button>
            <button onClick={zoomOut} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Zoom Out"><Minus className="w-4 h-4 mx-auto" /></button>
            <button onClick={fitView} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Fit View"><Maximize className="w-4 h-4 mx-auto" /></button>
            <button onClick={handleResetLayout} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Reset Layout"><RefreshCcw className="w-4 h-4 mx-auto" /></button>
            <button onClick={handleDownload} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Download JSON"><Download className="w-4 h-4 mx-auto" /></button>
            <button onClick={handleExportImage} disabled={isExportingImage} className={cn("p-2 rounded-lg transition-colors disabled:opacity-60", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title={isExportingImage ? "Exporting..." : "Export Image"}>{isExportingImage ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : <ImageIcon className="w-4 h-4 mx-auto" />}</button>
            <button onClick={() => setLayoutDirection(layoutDirection === 'LR' ? 'TB' : 'LR')} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Toggle Layout"><Layout className={cn("w-4 h-4 mx-auto", layoutDirection === 'TB' && "rotate-90")} /></button>
            <button onClick={() => setIsShortcutsOpen(true)} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700")} title="Shortcuts"><Keyboard className="w-4 h-4 mx-auto" /></button>
          </div>

          <button
            onClick={() => setIsHistoryOpen(prev => !prev)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-colors",
              isDarkMode ? "bg-white/5 text-gray-300 hover:text-white" : "bg-gray-100 text-gray-700 hover:text-gray-900"
            )}
          >
            <History className="w-4 h-4" />
            Local History
          </button>

          {isHistoryOpen && (
            <div className={cn(
              "max-h-48 overflow-y-auto rounded-lg border",
              isDarkMode ? "border-white/10 bg-black/20" : "border-gray-200 bg-gray-50"
            )}>
              {history.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500 italic">No history yet</div>
              ) : (
                history.slice(0, 8).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectHistory(h);
                      setIsHistoryOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs truncate transition-colors",
                      isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-white text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {h.substring(0, 80)}...
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
