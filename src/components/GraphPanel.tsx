import React from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
} from 'reactflow';
import { cn } from '../lib/utils';
import { JsonNode, JsonEdge } from '../types';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface GraphPanelProps {
  isDarkMode: boolean;
  nodes: JsonNode[];
  edges: JsonEdge[];
  onNodesChange: any;
  onEdgesChange: any;
}

const GraphPanel: React.FC<GraphPanelProps> = ({
  isDarkMode,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}) => {
  return (
    <div className={cn(
      "flex-1 relative",
      isDarkMode ? "bg-[#0a0a0c]" : "bg-white"
    )}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color={isDarkMode ? "#333" : "#f1f1f1"} gap={20} variant={isDarkMode ? "dots" : "lines"} />
        <Controls 
          showInteractive={false} 
          className={cn(
            "!shadow-none !border",
            isDarkMode ? "!bg-white/5 !border-white/10" : "!bg-white !border-gray-200"
          )} 
        />
        <MiniMap 
          nodeColor={isDarkMode ? "#333" : "#f1f1f1"} 
          maskColor={isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)"}
          className={cn(
            "!border",
            isDarkMode ? "!bg-[#0d0d0f] !border-white/5" : "!bg-white !border-gray-200"
          )}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};

export default GraphPanel;
