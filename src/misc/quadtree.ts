import { Coordinate } from "./interface";

export interface Node {
  id: string;
  x: number;
  y: number;
  size?: number;
}

export interface Edge {
  from: Node,
  to: Node,
}

export interface RectArea {
  x: number;
  y: number;
  x1: number;
  y1: number;
}

export class QuadTree {
  private _nodes: Node[] = [];
  private _children: QuadTree[] = [];
  private _area: RectArea = { x: 0, y: 0, x1: 0, y1: 0 };
  centroid: Coordinate = { x: 0, y: 0 };
  centroidSize: number = 0;
  constructor(nodes: Node[]) {
    this._nodes = nodes;
    this.calcCentroid(nodes);
  }
  calcCentroid(nodes: Node[]) {
    this.centroid.x = nodes.map((node: Node) => node.x * (node.size || 1)).reduce((a: number, b: number) => a + b, 0) / nodes.length;
    this.centroid.y = nodes.map((node: Node) => node.y * (node.size || 1)).reduce((a: number, b: number) => a + b, 0) / nodes.length;
    this.centroidSize = nodes.map((node: Node) => node.size || 1).reduce((a: number, b: number) => a + b, 0);
  }
  get area(): RectArea {
    return this._area;
  }
  set area(area: RectArea) {
    this._area = area;
  }
  get children(): QuadTree[] {
    return this._children;
  }
  set children(children: QuadTree[]) {
    this._children = children;
  }
  get nodes(): Node[] {
    return this._nodes;
  }
  hasNodes(): boolean {
    return this._nodes.length !== 0;
  }
  setNodes(nodes: Node[]) {
    this._nodes = nodes;
  }
  addChild(child: QuadTree) {
    this._children.push(child);
  }
  hasChildren(): boolean {
    return this._children.length !== 0;
  }
}