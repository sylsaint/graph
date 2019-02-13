import Graph, { Vertex, Edge } from '../misc/graph';

export function makeHierarchy(g: Graph) {
  let roots: Array<Vertex> = [];
  // find all the roots without incoming edges
  g.vertices.map(v => {
    let isRoot: boolean = true;
    let outDegree: number = 0;
    let inDegree: number = 0;
    v.edges.map(edge => {
      if (edge.down == v) {
        isRoot = false;
        inDegree += 1;
      } else {
        outDegree += 1;
      }
    })
    if (isRoot) {
      roots.push(v);
    } else {
      v.setOptions('outInRatio', outDegree / inDegree);
    }
  })
  // judge if roots is empty, if yes, add max (out(v) / in (v)) to roots
  if (!roots.length) {
    // find the maximum ratio
    let max: number = 0;
    g.vertices.map(v => {
      let ratio: number = v.getOptions('outInRatio');
      if (ratio > max) max = ratio;
    })
    g.vertices.map(v => {
      if (v.getOptions('outInRatio') == max) roots.push(v);
    })
  }
  let visited = [];
  while (roots.length) {
    const node: Vertex = roots.shift();
    if (!node.getOptions('level')) {
      node.setOptions('level', 1);
    }
    if (visited.indexOf(node) > -1) {
      continue;
    }
    visited.push(node);
    let exclude: Array<Edge> = [];
    node.edges.map(edge => {
      const down: Vertex = edge.down;
      exclude.push(edge);
      let only: boolean = true;
      // check if there are other incomming edges
      down.edges.map(edge => {
        if (edge.up != node && edge.down == down) only = false;
      })
      if (only) {
        let downLevel: number = down.getOptions('level');
        if (!downLevel) {
          down.setOptions('level', node.getOptions('level') + 1);
        } else {
          // ensure even there are cycles, procedure can be terminated
          if (downLevel < (node.getOptions('level') + 1) && downLevel != 1) {
            down.setOptions('level', node.getOptions('level') + 1);
          }
        }
        roots.push(down);
      }
    })
    exclude.map(edge => g.removeEdge(edge));
  }
  return visited;
}