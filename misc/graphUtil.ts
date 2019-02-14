import Graph, { Vertex, Edge } from "./graph";

let BASE_DUMMY_ID = 100000;

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

export function cloneGraph(g: Graph): Graph {
  let replica: Graph = new Graph([], [], { directed: true });
  // clone W to Graph pg
  g.vertices.map(v => {
    replica.addVertex(new Vertex(v.id));
  });
  g.edges.map(edge => {
    replica.addEdge(
      new Edge(findVertexById(replica, edge.up.id), findVertexById(replica, edge.down.id))
    );
  })
  return replica;
}

export function printVertexNeighbours(g: Graph) {
  console.log("== print incident edges of vertex ==");
  g.vertices.map(v => {
    let ups: Array<number> = [];
    let downs: Array<number> = [];
    v.edges.map(edge => {
      if (edge.up == v) downs.push(edge.down.id + 1);
      if (edge.down == v) ups.push(edge.up.id + 1);
    });
    console.log(ups.join(","), "->", v.id + 1, "->", downs.join(","));
  });
}


export function getDummyId() {
  BASE_DUMMY_ID += 1;
  return BASE_DUMMY_ID;
}