import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { SHORTCUTS } from '../constants';

interface ShortcutsMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
}

const ShortcutsMenu: React.FC<ShortcutsMenuProps> = ({ isOpen, setIsOpen, isDarkMode }) => {
  return (
    <div className="relative ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded transition-all",
          isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-widest">Shortcuts</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "absolute right-0 mt-2 w-56 rounded-lg border shadow-xl p-1 z-[100]",
              isDarkMode ? "bg-[#1a1a1e] border-white/10" : "bg-white border-gray-200"
            )}
          >
            {SHORTCUTS.map((s, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded transition-colors",
                  isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                )}
              >
        <span className={cn(
          "text-[11px] font-medium",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>{s.desc}</span>
        <span className={cn(
          "text-[10px] font-mono px-1.5 py-0.5 rounded border",
          isDarkMode ? "bg-white/10 border-white/10 text-gray-300" : "bg-white border-gray-200 text-gray-900"
        )}>{s.key}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShortcutsMenu;
