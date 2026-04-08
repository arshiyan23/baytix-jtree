import dagre from 'dagre';
import { Position, MarkerType } from 'reactflow';
import { JsonNode, JsonEdge } from '../types';

export const getLayoutedElements = (nodes: JsonNode[], edges: JsonEdge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: isHorizontal ? 100 : 200, 
    ranksep: isHorizontal ? 200 : 150 
  });

  nodes.forEach((node) => {
    const propertyCount = node.data.properties.length;
    // Estimate height: Header (48px) + each property (approx 24px) + padding (20px)
    const height = 48 + (propertyCount * 24) + 20;
    
    // Estimate width: Base 250px, but check if any property key/value is long
    let maxWidth = 250;
    node.data.properties.forEach(prop => {
      const keyLen = prop.key.length;
      const valLen = String(prop.value).length;
      // Approx 8px per char for mono font, plus some padding
      const estimatedWidth = (keyLen + valLen) * 8 + 60;
      if (estimatedWidth > maxWidth) maxWidth = estimatedWidth;
    });
    
    // Cap width to prevent ultra-wide nodes
    maxWidth = Math.min(maxWidth, 500);
    
    dagreGraph.setNode(node.id, { width: maxWidth, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };
  });

  return { nodes, edges };
};

export const createGraphElements = (
  json: any, 
  filter: string = '', 
  collapsed: Set<string>, 
  toggleNode: (id: string) => void,
  onUpdateValue: (path: string, newValue: any) => void,
  onHover: (path: string | null) => void,
  isDarkMode: boolean,
  direction: string = 'LR'
) => {
  const newNodes: JsonNode[] = [];
  const newEdges: JsonEdge[] = [];
  let idCounter = 0;

  const traverse = (data: any, label: string, parentId: string | null = null, currentPath: string = 'root') => {
    const id = `node-${idCounter++}`;
    const type = Array.isArray(data) ? 'array' : typeof data === 'object' && data !== null ? 'object' : 'primitive';
    const isCollapsed = collapsed.has(id);
    
    const properties: any[] = [];
    if (type === 'object' || type === 'array') {
      Object.entries(data).forEach(([key, value]) => {
        const valType = Array.isArray(value) ? 'array' : typeof value === 'object' && value !== null ? 'object' : 'primitive';
        const propPath = Array.isArray(data) ? `${currentPath}[${key}]` : `${currentPath}.${key}`;
        
        properties.push({ key, value, type: valType, path: propPath });
        
        if (!isCollapsed && (valType === 'object' || valType === 'array')) {
          traverse(value, key, id, propPath);
        }
      });
    }

    const matchesSearch = filter === '' || 
      label.toLowerCase().includes(filter.toLowerCase()) || 
      properties.some(p => p.key.toLowerCase().includes(filter.toLowerCase()) || String(p.value).toLowerCase().includes(filter.toLowerCase()));

    if (matchesSearch || parentId === null) {
      newNodes.push({
        id,
        type: 'custom',
        data: {
          label,
          type,
          properties,
          isRoot: parentId === null,
          isExpanded: !isCollapsed,
          onToggle: () => toggleNode(id),
          onUpdateValue,
          onHover,
          isDarkMode,
          path: currentPath,
          layoutDirection: direction as 'LR' | 'TB',
        },
        position: { x: 0, y: 0 },
      });

      if (parentId) {
        newEdges.push({
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        });
      }
    }
  };

  traverse(json, 'Root');
  return getLayoutedElements(newNodes, newEdges, direction);
};
