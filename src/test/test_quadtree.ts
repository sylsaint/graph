import { expect } from 'chai';
import { QuadTree, Node } from '../misc/quadtree';
import { dividePlane } from '../algos/quadtree';

describe('QuadTree', () => {
  const nodes: Node[] = [];
  for (let i: number = 0; i < 1000; i++) {
    nodes.push({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      size: 1
    });
  }

  it('#divide rectangle', () => {
    const qt: QuadTree = new QuadTree(nodes);
    dividePlane(qt, 4, { x: 0, y: 0, x1: 1000, y1: 1000 });
  });
});
