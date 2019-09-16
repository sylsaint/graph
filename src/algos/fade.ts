import { Node, Edge, QuadTree } from "../misc/quadtree";
import { Force, coulombForce, hookeForce } from "../misc/force";
import { Coordinate } from "../misc/interface";

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


function fadeLayout(nodes: Node[], edges: Edge, options?: FadeOptions): Node[] {
  let fadeOptions: FadeOptions = {
    repulsion: 100,
    stiffness: 0.5,
    springLength: 50,
    interationCount: 10,
    measureThreshold: 1,
    epsilon: 1e-6,
  }
  if (options) fadeOptions = { ...fadeOptions, ...options };

  return nodes;
}

function accumulateForce(node: Node, qt: QuadTree, repulsion: number): Force {
  const forces: Force[] = [];
  const treeStack: QuadTree[] = [];
  qt.children.map((tree: QuadTree) => {
    treeStack.push(tree);
  })
  while (treeStack.length) {
    const t: QuadTree = treeStack.pop() as QuadTree;
    const s: number = ((t.area.x1 - t.area.x) + (t.area.y1 - t.area.y)) / 2;
    const distance: number = euclidDistance(t.centroid, node as Coordinate);
    if (measure(s, distance, 1)) {
      forces.push(coulombForce(repulsion, distance, node, t.centroid));
    } else {
      if (t.hasChildren()) {
        t.children.map((subTree: QuadTree) => {
          treeStack.push(subTree);
        })
      } else {
        t.nodes.map((leaf: Node) => {
          const dis: number = euclidDistance(node, leaf);
          forces.push(coulombForce(repulsion, dis, node, leaf));
        })
      }
    }
  }
}

function euclidDistance(p1: Coordinate, p2: Coordinate): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}