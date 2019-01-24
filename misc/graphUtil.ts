import Graph, { Vertex, Edge } from "./graph";

// in-place transpose edge direction
export function transpose(g: Graph): Graph {
  g.edges.map(edge => {
    const v: Vertex = edge.down;
    edge.down = edge.up;
    edge.up = v;
  });
  return g;
}

export function findVertexById(g: Graph, vid: number): Vertex {
  let found: Vertex;
  g.vertices.map(v => {
    if (v.id === vid) found = v;
  });
  return found;
}

export function printVertexNeighbours(g: Graph) {
  g.vertices.map(v => {
    let ups: Array<number> = [];
    let downs: Array<number> = [];
    v.edges.map(edge => {
      if (edge.up == v) downs.push(edge.down.id + 1);
      if (edge.down == v) ups.push(edge.up.id + 1);
    });
    console.log(ups.join(","), "<-", v.id + 1, "<-", downs.join(","));
  });
}
