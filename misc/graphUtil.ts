import Graph, { Vertex, Edge } from './graph';

// in-place transpose edge direction
export function transpose(g: Graph): Graph {
  g.edges.map(edge => {
    const v: Vertex = edge.down;
    edge.down = edge.up;
    edge.up = v;
  })
  return g;
}