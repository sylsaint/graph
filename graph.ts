export class Vertex {
  id: Number;
  opts: Object;
  constructor(id: Number, opts?: Object) {
    this.id = id;
    this.opts = opts || {};
  }
}

export class Edge {
  source: Vertex;
  target: Vertex;
  constructor(source: Vertex, target: Vertex) {
    this.source = source;
    this.target = target;
  }
}

export default class Graph {
  vertices: Array<Vertex> = [];
  edges: Array<Edge> = [];
  opts: any = { directed: false };
  constructor(vertices?: Array<Vertex>, edges?: Array<Edge>, opts?: any) {
    vertices && (this.vertices = vertices);
    edges && (this.edges = edges);
    opts && (this.opts = { ...this.opts, opts });
  }
  addVertex(v: Vertex) {
    this.vertices.push(v);
  }
  addVertexSafe(v: Vertex) {
    if (!this.hasVertex(v.id)) {
      this.vertices.push(v);
    }
  }
  removeVertex(vid: Number): any {
    let rmNode;
    let rmIdx = -1;
    this.vertices.map((v, idx) => {
      if (v.id === vid) {
        rmNode = v;
        rmIdx = idx;
      }
    })
    if (rmIdx !== -1) {
      this.vertices.splice(rmIdx, 1);
    }
    this.edges.map((e) => {
      if (e.source.id === vid || e.target.id === vid) {
        this.removeEdge(e);
      }
    })
    return rmNode;
  }
  addEdge(edge: Edge) {
    this.edges.push(edge);
  }
  addEdgeSafe(edge: Edge) {
    let canAdd = true;
    // check if edge is valid
    if (!this.hasVertex(edge.source.id) || !this.hasVertex(edge.target.id)) {
      canAdd = false;
    }
    // check if edge is existing
    if (this.hasEdge(edge)) {
      canAdd = false;
    }
    if (canAdd) {
      this.addEdge(edge);
    }
  }
  edgeAddible(edge: Edge): Boolean {
    let canAdd = true;
    // check if edge is existing
    if (this.hasEdge(edge)) {
      canAdd = false;
    }
    // check if edge is valid
    if (!this.hasVertex(edge.source.id) || !this.hasVertex(edge.target.id)) {
      canAdd = false;
    }
    return canAdd;
  }
  removeEdge(edge: Edge): any {
    let rmEdge;
    let rmIdx = -1;
    this.edges.map((e, idx) => {
      if (e.source.id === edge.source.id && e.target.id === edge.target.id) {
        rmIdx = idx;
      }
      if (!this.opts.directed && e.source.id === edge.target.id && e.target.id === edge.source.id) {
        rmIdx = idx;
      }
    })
    if (rmIdx !== -1) {
      rmEdge = this.edges[rmIdx];
      this.edges.splice(rmIdx, 1);
    }
    return rmEdge;
  }
  hasEdge(edge: Edge): Boolean {
    let edgeExisting = false;
    this.edges.map(e => {
      if (e.source.id === edge.source.id && e.target.id === edge.target.id) {
        edgeExisting = true;
      }
      if (!this.opts.directed && e.source.id === edge.target.id && e.target.id === edge.source.id) {
        edgeExisting = true;
      }
    })
    return edgeExisting;
  }
  public hasVertex(vid: Number): Boolean {
    let hasV = false;
    this.vertices.map(v => {
      if (v.id === vid) {
        hasV = true;
      }
    })
    return hasV;
  }
  order(): Number {
    return this.vertices.length;
  }
  empty(): Boolean {
    return this.order() == 0;
  }
  isTrivial(): Boolean {
    return this.order() <= 1;
  }
}

export class GraphUtils {
  constructor() {

  }
  // copy graph
  static clone(g: Graph): Graph {
    let cloned = new Graph();
    if (g.empty()) return cloned;
    g.vertices.map(v => {
      cloned.addVertex(v);
    })
    g.edges.map(e => {
      cloned.addEdge(e);
    })
    cloned.opts = { ...g.opts };
    return cloned;
  }
  // Union(G<V, E>, G'<V', E'>) = G<V U V', E U E'>
  static union(g1: Graph, g2: Graph): Graph {
    let ug: Graph = new Graph();
    // add vertices
    g1.vertices.map(v => {
      ug.addVertex(v);
    })
    g2.vertices.map(v => {
      ug.addVertexSafe(v);
    })

    // add edges
    g1.edges.map(e => {
      ug.addEdge(e);
    })
    g2.edges.map(e => {
      ug.addEdgeSafe(e);
    })
    return ug;
  }
  // Intersect(G<V, E>, G'<V', E'>) = G<V  V', E  E'>
  static intersect(g1: Graph, g2: Graph): Graph {
    let ig: Graph = new Graph();
    // add vertices in g1 and g2
    g1.vertices.map(v => {
      if (g2.hasVertex(v.id)) ig.addVertex(v);
    })

    // add edges in g1 and g2
    g1.edges.map(e => {
      if (g2.hasEdge(e)) ig.addEdge(e);
    })
    return ig;
  }
  // Difference(G<V, E>, G'<V', E'>) = G<V - V', E - E'>
  static diff(g1: Graph, g2: Graph): Graph {
    let dg: Graph = new Graph();
    g1.vertices.map(v => {
      if (!g2.hasVertex(v.id)) dg.addVertex(v);
    })
    g1.edges.map(e => {
      if (!g2.hasEdge(e) && dg.hasVertex(e.source.id) && dg.hasVertex(e.target.id)) dg.addEdge(e);
    })
    return dg;
  }
  vertices(g: Graph): Array<Vertex> {
    return g.vertices;
  }
  edges(g: Graph): Array<Edge> {
    return g.edges;
  }
  order(g: Graph): Number {
    // |Graph|
    return g.vertices.length;
  }
  edgeOrder(g: Graph): Number {
    // || Graph ||
    return g.edges.length;
  }
  isTrivial(g: Graph): Boolean {
    return g.isTrivial();
  }
  disjoint(g1: Graph, g2: Graph): Boolean {
    return GraphUtils.intersect(g1, g2).empty();
  }
  // test if g1 is the subgraph of g2
  static subgraph(g1: Graph, g2: Graph): Boolean {
    if (g1.empty()) return true;
    let isSub = true;
    g1.vertices.map(v => {
      if (!g2.hasVertex(v.id)) isSub = false;
    })
    g1.edges.map(e => {
      if (!g2.hasEdge(e)) isSub = false;
    })
    return isSub;
  }

  // test if g1 is the supergraph of g2
  static supergraph(g1: Graph, g2: Graph): Boolean {
    return GraphUtils.subgraph(g2, g1);
  }

  static edgeInducedSubgraph(g1: Graph, g2: Graph): Boolean {
    if (g1.empty()) return true;
    const isSub = GraphUtils.subgraph(g1, g2);
    if (!isSub) return false;
    let induced = true;
    g1.edges.map(e => {
      if (!g1.hasVertex(e.source.id) || !g1.hasVertex(e.target.id)) induced = false;
    })
    return induced;
  }

  // g1 is contained in g2 and for any x, y belong to g1<V'>, 
  // if xy belongs to g2<E> then xy belongs to g1<E'>
  static inducedSubgraph(g1: Graph, g2: Graph): Boolean {
    if (g1.empty()) return true;
    const isSub = GraphUtils.subgraph(g1, g2);
    if (!isSub) return false;
    let induced = true;
    g2.edges.map(e => {
      if (g1.hasVertex(e.source.id) && g1.hasVertex(e.target.id)) {
        if (!g1.hasEdge(e)) induced = false;
      }
    })
    return induced;
  }

  // spanning subgraph
  static spanningSubgraph(g1: Graph, g2: Graph): Boolean {
    if (g1.empty()) return true;
    if (GraphUtils.subgraph(g1, g2) && g1.vertices.length === g2.vertices.length) return true;
    return false;
  }

  // G - U (U is the set of vertices) = G[V\U] = deleting all the vertices in U ∩ V and their incident edges
  static minusVertices(g1: Graph, U: Array<Vertex>): Graph {
    let cloned = GraphUtils.clone(g1);
    if (g1.empty()) return cloned;
    if (!U.length) return cloned;
    U.map(v => {
      if (cloned.hasVertex(v.id)) {
        cloned.edges.map(e => {
          if (e.source.id === v.id || e.target.id === v.id) {
            cloned.removeEdge(e);
          }
        })
        cloned.removeVertex(v.id);
      }
    })
    return cloned;
  }
  // G - F(subset of [V]^2) =: (V, E\F)
  static minusEdges(g1: Graph, E: Array<Edge>): Graph {
    let cloned = GraphUtils.clone(g1);
    if (g1.empty()) return cloned;
    if (!E.length) return cloned;
    E.map(e => {
      if (cloned.hasEdge(e)) cloned.removeEdge(e);
    })
    return cloned;
  }
  // G + F =: (V, E U F)
  static plusEdges(g1: Graph, E: Array<Edge>): Graph {
    let cloned = GraphUtils.clone(g1);
    if (!E.length) return cloned;
    E.map(e => {
      if (cloned.edgeAddible(e)) cloned.addEdge(e);
    })
    return cloned;
  }
  // complement graph
  static complement(g: Graph): Graph {
    let cmp: Graph = new Graph();
    g.vertices.map((v, idx) => {
      cmp.addVertex(v);
      for (let j: number = idx + 1; j < g.vertices.length; j++) {
        const edge = new Edge(v, g.vertices[j]);
        if (!g.hasEdge(edge)) cmp.addEdge(edge);
      }
    })
    return cmp;
  }
  // line graph of G, vertext -> edge; edge -> vertex
  static lineGraph(g: Graph): Graph {
    let lg: Graph = new Graph();
    let edgeMap: object = {};
    g.edges.map((e, idx) => {
      const v = new Vertex(idx);
      edgeMap[`${e.source.id}-${e.target.id}`] = v;
      lg.addVertex(v);
    })
    g.edges.map((e, idx) => {
      for (let j: number = idx + 1; j < g.edges.length; j++) {
        const ne = g.edges[j];
        let adjacent = false;
        if (e.target.id === ne.target.id || e.source.id === ne.source.id) {
          adjacent = true;
        }
        if (e.target.id === ne.source.id || e.source.id === ne.target.id) {
          adjacent = true;
        }
        if (adjacent) {
          const source = edgeMap[`${e.source.id}-${e.target.id}`];
          const target = edgeMap[`${ne.source.id}-${ne.target.id}`];
          const edge = new Edge(source, target);
          lg.addEdge(edge);
        }
      }
    })
    return lg;
  }
  static neighbours(g: Graph, v: Vertex): Array<Vertex> {
    let ngbs: Array<Vertex> = [];
    if (!g.hasVertex(v.id)) return ngbs;
    if (g.empty()) return ngbs;
    g.edges.map(e => {
      if (e.source.id === v.id) ngbs.push(e.target);
      if (e.target.id === v.id) ngbs.push(e.source);
    })
    return ngbs;
  }
  // U contained in V, N(U) = { (u, v) belongs to E | v belongs to [V\U], u belongs to U}
  static neighboursOfSet(g: Graph, vs: Array<Vertex>): Array<Vertex> {
    let ngbs: Array<Vertex> = [];
    if (g.empty()) return ngbs;
    const isVertexExist = (v) => { let exist = false; vs.map(cv => { if (cv.id === v.id) exist = true; }); return exist };
    vs.map(v => {
      g.edges.map(e => {
        if (e.source.id === v.id) !isVertexExist(e.target) && ngbs.push(e.target);
        if (e.target.id === v.id) !isVertexExist(e.source) && ngbs.push(e.source);
      })
    })
    return ngbs;
  }

  // degree of Vertex
  static degree(g: Graph, v: Vertex): number {
    let dg: number = 0;
    g.edges.map(e => {
      if (e.target.id === v.id) dg += 1;
      if (e.source.id === v.id) dg += 1;
    })
    return dg;
  }

  // average degree
  static avgDegree(g: Graph): number {
    if (g.empty()) return 0;
    let total: number = 0;
    g.vertices.map(v => {
      let dg = 0;
      g.edges.map(e => {
        if (e.target.id === v.id) dg += 1;
        if (e.source.id === v.id) dg += 1;
      })
      total += dg;
    })
    return total / g.vertices.length;
  }

  // minium degree of G
  static minDegree(g: Graph): number {
    let min: number = Number.POSITIVE_INFINITY;
    g.vertices.map(v => {
      let dg = 0;
      g.edges.map(e => {
        if (e.target.id === v.id) dg += 1;
        if (e.source.id === v.id) dg += 1;
      })
      if (dg < min) min = dg;
    })
    return min;
  }
  // maxium degree of G
  static maxDegree(g: Graph): number {
    let max: number = Number.NEGATIVE_INFINITY;
    g.vertices.map(v => {
      let dg = 0;
      g.edges.map(e => {
        if (e.target.id === v.id) dg += 1;
        if (e.source.id === v.id) dg += 1;
      })
      if (dg > max) max = dg;
    })
    return max;
  }
  // judge if graph is regular(all the degrees of vertices are equal)
  static regular(g: Graph): Boolean {
    if (GraphUtils.minDegree(g) === GraphUtils.maxDegree(g)) return true;
    return false;
  }
  static cubic(g: Graph): Boolean {
    if (!GraphUtils.regular(g)) return false;
    let dg = 0;
    g.edges.map(e => {
      if (e.target.id === g.vertices[0].id) dg += 1;
      if (e.source.id === g.vertices[0].id) dg += 1;
    })
    return dg === 3;
  }
}