import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FooterProps {
  isDarkMode: boolean;
  isValid: boolean;
  stats?: { nodes: number; depth: number; size: string; properties: number };
}

const Footer: React.FC<FooterProps> = ({ isDarkMode, isValid, stats }) => {
  return (
    <footer className={cn(
      "border-t px-3 py-2 text-xs font-medium transition-colors md:h-10 md:px-4 md:py-0",
      isDarkMode ? "bg-[#0d0d0f] border-white/5 text-gray-500" : "bg-white border-gray-900 text-gray-400"
    )}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:h-full">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/assets/logo-full.png"
              alt="JTree Logo"
              className={cn(
                "h-4 sm:h-5 w-auto object-contain transition-all duration-300",
                isDarkMode && "invert brightness-0 invert"
              )}
            />
          </div>
          <a href="https://apps.baytix.net" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-500 transition-colors shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Baytix Apps</span>
          </a>
          <div className={cn("hidden sm:block h-4 w-[1px]", isDarkMode ? "bg-white/10" : "bg-gray-200")} />
          <span className="hidden sm:inline text-gray-400">© 2026 Baytix. All rights reserved.</span>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          {stats && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider sm:flex sm:items-center sm:gap-4">
              <span>Nodes: <span className={cn(isDarkMode ? "text-blue-400" : "text-gray-900 font-bold")}>{stats.nodes}</span></span>
              <span>Props: <span className={cn(isDarkMode ? "text-blue-400" : "text-gray-900 font-bold")}>{stats.properties}</span></span>
              <span>Depth: <span className={cn(isDarkMode ? "text-blue-400" : "text-gray-900 font-bold")}>{stats.depth}</span></span>
              <span>Size: <span className={cn(isDarkMode ? "text-blue-400" : "text-gray-900 font-bold")}>{stats.size}</span></span>
            </div>
          )}
          <div className={cn(
            "inline-flex w-fit items-center gap-2 px-2 py-1 rounded",
            isValid ? "text-emerald-500 bg-emerald-500/5" : "text-red-500 bg-red-500/5"
          )}>
            {isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{isValid ? "Valid JSON format" : "Invalid JSON format"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
