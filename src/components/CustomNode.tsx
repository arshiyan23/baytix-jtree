import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronRight, Braces, LayoutGrid, FileText, Copy, Check, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { JsonNodeData } from '../types';

const CustomNode = ({ data }: { data: JsonNodeData }) => {
  const { label, type, properties, isRoot, isExpanded, onToggle, onUpdateValue, onHover, isDarkMode, path, layoutDirection } = data;
  const [copied, setCopied] = useState(false);
  const [editingProp, setEditingProp] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const copyPath = (e: React.MouseEvent, p: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = (e: React.MouseEvent, prop: any) => {
    e.stopPropagation();
    setEditingProp(prop.path);
    setEditValue(String(prop.value));
  };

  const saveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingProp) {
      // Try to parse as number or boolean if possible
      let finalValue: any = editValue;
      if (editValue === 'true') finalValue = true;
      else if (editValue === 'false') finalValue = false;
      else if (!isNaN(Number(editValue)) && editValue.trim() !== '') finalValue = Number(editValue);
      
      onUpdateValue(editingProp, finalValue);
      setEditingProp(null);
    }
  };

  const getPropColor = (type: string, value: any) => {
    if (isDarkMode) {
      if (value === null) return "text-red-400";
      if (typeof value === 'boolean') return "text-purple-400";
      if (typeof value === 'number') return "text-orange-400";
      if (type === 'primitive') return "text-amber-400";
      if (type === 'object') return "text-blue-400";
      return "text-emerald-400";
    } else {
      // Notion style: mostly black/gray with very subtle accents
      if (value === null) return "text-red-600";
      if (typeof value === 'boolean') return "text-gray-900 font-bold";
      if (typeof value === 'number') return "text-gray-900 font-bold";
      if (type === 'primitive') return "text-gray-900";
      if (type === 'object') return "text-gray-400";
      return "text-gray-400";
    }
  };

  return (
    <div 
      onMouseEnter={() => onHover(path)}
      onMouseLeave={() => onHover(null)}
      className={cn(
      "min-w-[250px] max-w-[500px] rounded-lg border transition-all duration-200 group/node",
      isDarkMode 
        ? "bg-[#1a1a1e] border-white/10 text-gray-200 shadow-2xl" 
        : "bg-white border-gray-900 text-gray-900 shadow-sm hover:shadow-md",
      isRoot && (isDarkMode ? "border-blue-500/50 shadow-blue-500/20" : "border-gray-900 border-2 shadow-lg shadow-gray-100")
    )}>
      <Handle 
        type="target" 
        position={layoutDirection === 'LR' ? Position.Left : Position.Top} 
        className={cn("!w-2 !h-2 !border-2", isDarkMode ? "!bg-blue-500 !border-[#1a1a1e]" : "!bg-gray-900 !border-white")} 
      />
      
      {/* Node Header */}
      <div className={cn(
        "px-3 py-1.5 border-b flex items-center justify-between gap-3",
        isDarkMode ? "border-white/5 bg-white/5" : "border-gray-900 bg-gray-50/30"
      )}>
        <div className="flex items-center gap-2 overflow-hidden">
          {type === 'object' ? <Braces className={cn("w-3.5 h-3.5 shrink-0", isDarkMode ? "text-blue-500" : "text-gray-900")} /> : 
           type === 'array' ? <LayoutGrid className={cn("w-3.5 h-3.5 shrink-0", isDarkMode ? "text-emerald-500" : "text-gray-900")} /> : 
           <FileText className={cn("w-3.5 h-3.5 shrink-0", isDarkMode ? "text-amber-500" : "text-gray-900")} />}
          <span className="font-bold truncate text-[12px] tracking-tight">{label}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => copyPath(e, path)}
            className={cn(
              "p-1 rounded-md transition-colors opacity-0 group-hover/node:opacity-100",
              isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-200 text-gray-600"
            )}
            title="Copy path"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {(type === 'object' || type === 'array') && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={cn(
                "p-1 rounded-md transition-colors",
                isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-200 text-gray-600"
              )}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-2.5 space-y-1">
        {properties.map((prop, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] group/prop relative">
            <span className={cn(
              "font-medium shrink-0",
              isDarkMode ? "text-gray-400" : "text-gray-400"
            )}>{prop.key}</span>
            <span className="text-gray-200 dark:text-gray-200">:</span>
            
            {editingProp === prop.path ? (
              <form onSubmit={saveEdit} className="flex-1 flex gap-1">
                <input 
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveEdit()}
                  className={cn(
                    "flex-1 px-1 rounded border outline-none",
                    isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-gray-100 border-gray-300 text-black"
                  )}
                />
              </form>
            ) : (
              <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                <span className={cn(
                  "truncate font-mono",
                  getPropColor(prop.type, prop.value)
                )}>
                  {prop.type === 'primitive' ? String(prop.value) : 
                   prop.type === 'object' ? '{...}' : '[...]'}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover/prop:opacity-100 transition-opacity shrink-0">
                  {prop.type === 'primitive' && (
                    <button 
                      onClick={(e) => startEditing(e, prop)}
                      className="p-0.5 hover:text-blue-500 transition-colors"
                      title="Edit value"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => copyPath(e, prop.path)}
                    className="p-0.5 hover:text-blue-500 transition-colors"
                    title="Copy path"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {properties.length === 0 && (
          <div className="text-xs italic text-gray-500 py-1">Empty {type}</div>
        )}
      </div>

      <Handle 
        type="source" 
        position={layoutDirection === 'LR' ? Position.Right : Position.Bottom} 
        className={cn("!w-2 !h-2 !border-2", isDarkMode ? "!bg-blue-500 !border-[#1a1a1e]" : "!bg-gray-900 !border-white")} 
      />
    </div>
  );
};

export default memo(CustomNode);
