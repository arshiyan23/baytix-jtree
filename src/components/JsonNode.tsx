import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy, Hash, Type, ToggleLeft, Braces, List, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface JsonNodeProps {
  data: any;
  name?: string | number;
  depth?: number;
  isLast?: boolean;
  path?: string;
  onCopyPath: (path: string) => void;
  searchTerm: string;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  data,
  name,
  depth = 0,
  isLast = true,
  path = '',
  onCopyPath,
  searchTerm
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const type = Array.isArray(data) ? 'array' : typeof data;
  const isObject = data !== null && typeof data === 'object';
  const isEmpty = isObject && Object.keys(data).length === 0;

  const currentPath = path ? (typeof name === 'number' ? `${path}[${name}]` : `${path}.${name}`) : (name?.toString() || '');

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <span key={i} className="bg-yellow-400/30 text-yellow-100 rounded px-0.5">{part}</span> 
        : part
    );
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPath(currentPath);
  };

  const renderIcon = () => {
    switch (type) {
      case 'string': return <Type className="w-3 h-3 text-emerald-400" />;
      case 'number': return <Hash className="w-3 h-3 text-blue-400" />;
      case 'boolean': return <ToggleLeft className="w-3 h-3 text-purple-400" />;
      case 'array': return <List className="w-3 h-3 text-orange-400" />;
      case 'object': return <Braces className="w-3 h-3 text-cyan-400" />;
      default: return null;
    }
  };

  const renderValue = () => {
    if (data === null) return <span className="text-gray-500 italic">null</span>;
    if (type === 'string') return <span className="text-emerald-300">"{highlightText(data)}"</span>;
    if (type === 'number') return <span className="text-blue-300">{data}</span>;
    if (type === 'boolean') return <span className="text-purple-300">{data.toString()}</span>;
    return null;
  };

  if (!isObject || data === null) {
    return (
      <div className="flex items-center gap-2 py-0.5 group hover:bg-white/5 rounded px-2 transition-colors">
        <div className="flex items-center gap-1.5 min-w-[20px]">
          {renderIcon()}
        </div>
        {name !== undefined && (
          <span className="text-gray-400 font-medium">
            {highlightText(name.toString())}:
          </span>
        )}
        <div className="flex items-center gap-2">
          {renderValue()}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button onClick={handleCopyPath} title="Copy Path" className="p-1 hover:bg-white/10 rounded">
              <Copy className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
        {!isLast && <span className="text-gray-600">,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const length = keys.length;

  return (
    <div className="py-0.5">
      <div 
        className="flex items-center gap-2 group hover:bg-white/5 rounded px-2 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5 min-w-[20px]">
          {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          {renderIcon()}
        </div>
        {name !== undefined && (
          <span className="text-gray-300 font-bold">
            {highlightText(name.toString())}:
          </span>
        )}
        <span className="text-gray-500 text-xs font-mono">
          {type === 'array' ? `[${length}]` : `{${length}}`}
        </span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={handleCopy} title="Copy Value" className="p-1 hover:bg-white/10 rounded">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
          </button>
          <button onClick={handleCopyPath} title="Copy Path" className="p-1 hover:bg-white/10 rounded">
            <Copy className="w-3 h-3 text-blue-500" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 border-l border-white/10 pl-2 overflow-hidden"
          >
            {keys.map((key, index) => (
              <JsonNode 
                key={key}
                name={type === 'array' ? parseInt(key) : key}
                data={data[key]}
                depth={depth + 1}
                isLast={index === length - 1}
                path={currentPath}
                onCopyPath={onCopyPath}
                searchTerm={searchTerm}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JsonNode;
