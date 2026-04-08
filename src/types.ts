import { Node, Edge } from 'reactflow';

export type JsonValueType = 'object' | 'array' | 'primitive';

export interface JsonProperty {
  key: string;
  value: any;
  type: JsonValueType;
  path: string;
}

export interface JsonNodeData {
  label: string;
  type: JsonValueType;
  properties: JsonProperty[];
  isRoot: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateValue: (path: string, newValue: any) => void;
  onHover: (path: string | null) => void;
  isDarkMode: boolean;
  path: string;
  layoutDirection: 'LR' | 'TB';
}

export type JsonNode = Node<JsonNodeData>;
export type JsonEdge = Edge;
