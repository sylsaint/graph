import Graph, { Vertex } from '../misc/graph';
import { printVertexNeighbours } from '../misc/graphUtil';

export function kahn(g: Graph) {
  printVertexNeighbours(g);
  let roots: Array<Vertex> = [];
  // find all the roots without incoming edges
  g.vertices.map(v => {
    let isRoot: boolean = true;
    v.edges.map(edge => {
      if (edge.down == v) isRoot = false;
    })
    console.log(isRoot, v);
    if (isRoot) roots.push(v);
  })
  let visited = [];
  let hasCycle: boolean = false;
  while (roots.length) {
    const node: Vertex = roots.shift();
    if (visited.indexOf(node) > -1) {
      hasCycle = true;
      break;
    }
    visited.push(node);
    node.edges.map(edge => {
      if (edge.up == node) {
        const down: Vertex = edge.down;
        let only: boolean = true;
        // check if there are other incomming edges
        down.edges.map(edge => {
          if (edge.up != node) only = false;
        })
        if (only) roots.push(down);
      }
    })
  }
  if (hasCycle) {
    throw new Error("There are cycles in the graph!")
  }
  return visited;
}