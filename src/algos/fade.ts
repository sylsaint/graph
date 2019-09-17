import { Node, Edge, QuadTree } from "../misc/quadtree";
import { Force, coulombForce, hookeForce } from "../misc/force";
import { Coordinate } from "../misc/interface";
import { dividePlane } from '../algos/quadtree';

// s is width/height of quadtree area
// d is the distance between centroid and node
// theta is the threshold of measurement
function measure(s: number, d: number, theta: number): boolean {
  return s / d <= theta;
}

export interface FadeOptions {
  repulsion: number;
  stiffness: number;
  springLength: number;
  interationCount?: number;
  measureThreshold?: number;
  epsilon?: number;
}


export function fadeLayout(nodes: Node[], edges: Edge[], options?: FadeOptions): Node[] {
  let fadeOptions: FadeOptions = {
    repulsion: 100,
    stiffness: 0.5,
    springLength: 50,
    interationCount: 10,
    measureThreshold: 1,
    epsilon: 1e-6,
  }
  if (options) fadeOptions = { ...fadeOptions, ...options };
  const qt: QuadTree = dividePlane(new QuadTree(nodes), 4) as QuadTree;
  const nodeMap: { nodeHash: NodeHash, n2n: NodeToNodeMapping } = makeNodeMap(edges);
  for (let i = 0; i < (fadeOptions.interationCount || 5); i++) {
    nodes.map((node: Node) => {
      accumulateForce(node, qt, fadeOptions, nodeMap);
    })
  }
  return nodes;
}

function accumulateForce(node: Node, qt: QuadTree, fadeOptions: FadeOptions, nodeMap: { nodeHash: NodeHash, n2n: NodeToNodeMapping }): void {
  const forces: Force[] = [];
  // 计算弹力 引力 or 斥力
  const { n2n, nodeHash } = nodeMap;
  if (n2n[node.id]) {
    n2n[node.id].map((nid: string) => {
      const endNode: Node = nodeHash[nid];
      const distance: number = euclidDistance(node, endNode);
      const force: Force = hookeForce(fadeOptions.stiffness, distance - fadeOptions.springLength, node, endNode);
      forces.push(force);
    })
  }

  // 计算库仑力 斥力
  const treeStack: QuadTree[] = [];
  qt.children.map((tree: QuadTree) => {
    treeStack.push(tree);
  })
  while (treeStack.length) {
    const t: QuadTree = treeStack.pop() as QuadTree;
    const s: number = ((t.area.x1 - t.area.x) + (t.area.y1 - t.area.y)) / 2;
    const distance: number = euclidDistance(t.centroid, node as Coordinate);
    if (measure(s, distance, 1)) {
      forces.push(coulombForce(fadeOptions.repulsion, distance, { x: node.x, y: node.y }, t.centroid));
    } else {
      if (t.hasChildren()) {
        t.children.map((subTree: QuadTree) => {
          treeStack.push(subTree);
        })
      } else {
        t.nodes.map((leaf: Node) => {
          const dis: number = euclidDistance(node, leaf);
          // 节点不能和自己做运算
          if (node.id === leaf.id) return;
          forces.push(coulombForce(fadeOptions.repulsion, dis, { x: node.x, y: node.y }, { x: leaf.x, y: leaf.y }));
        })
      }
    }
  }
  const syntheticForce: Force = calcSyntheticForce(forces);
  moveNode(node, syntheticForce);
  console.log(node);
}

function moveNode(node: Node, force: Force) {
  if (force.value < 1) return;
  node.x += force.value * force.direct.x;
  node.y += force.value * force.direct.y;
}

function euclidDistance(p1: Coordinate, p2: Coordinate): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

interface NodeHash {
  [id: string]: Node;
}

interface NodeToNodeMapping {
  [id: string]: string[];
}

function makeNodeMap(edges: Edge[]): { nodeHash: NodeHash, n2n: NodeToNodeMapping } {
  const nodeHash: NodeHash = {};
  const n2n: NodeToNodeMapping = {};
  edges.map((edge: Edge) => {
    nodeHash[edge.from.id] = edge.from;
    nodeHash[edge.to.id] = edge.to;
    n2n[edge.from.id] ? n2n[edge.from.id].push(edge.to.id) : n2n[edge.from.id] = [edge.to.id];
    n2n[edge.to.id] ? n2n[edge.to.id].push(edge.from.id) : n2n[edge.to.id] = [edge.from.id];
  });
  return { nodeHash, n2n };
}

function normalize(vec: Coordinate): Coordinate {
  const rsqrt: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  if (rsqrt === 0) return {
    x: 1 / Math.sqrt(2),
    y: 1 / Math.sqrt(2)
  }
  return {
    x: vec.x / rsqrt,
    y: vec.y / rsqrt
  }
}

function calcSyntheticForce(forces: Force[]): Force {
  const finalForce: Force = { value: 0, direct: { x: 1, y: 1 } };
  let x: number = 0;
  let y: number = 0;
  forces.map((force: Force) => {
    const normalized: Coordinate = normalize(force.direct)
    x += force.value * normalized.x;
    y += force.value * normalized.y;
  })
  finalForce.value = Math.sqrt(x * x + y * y);
  finalForce.direct.x = x / finalForce.value;
  finalForce.direct.y = y / finalForce.value;
  return finalForce;
}