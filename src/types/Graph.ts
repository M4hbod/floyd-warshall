export interface NodeData {
  id: string;
  label: string;
}

export interface EdgeData {
  source: string;
  target: string;
  label: string;
}

export interface GraphElement {
  data: NodeData | EdgeData;
}
