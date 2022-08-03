// @author: limerary@gmail.com

export type GraphOptions = {
  digraph?: boolean;
};

export type Vertice = string | number;
// left is source, right is target
export type Edge = [Vertice, Vertice];

export default class Graph {
  private _vertices: Map<Vertice, boolean> = new Map();
  private _edges: Map<Vertice, Vertice[]> = new Map();
  private opts: GraphOptions = { digraph: true };
  constructor({
    vertices,
    edges,
    opts = { digraph: true },
  }: {
    vertices?: Vertice[];
    edges?: Edge[];
    opts?: GraphOptions;
  }) {
    vertices && this.addVertices(vertices);
    edges && this.addEdges(edges);
    opts && (this.opts = { ...this.opts, ...opts });
  }

  get vertices(): Vertice[] {
    return Array.from(this._vertices.keys());
  }

  hasVertice(vertice: Vertice): boolean {
    return this._vertices.has(vertice);
  }

  addVertice(vertice: Vertice): void {
    this._vertices.set(vertice, true);
  }

  addVertices(vertices: Vertice[]): void {
    vertices.map((vertice) => this.addVertice(vertice));
  }

  get edges(): Edge[] {
    return Array.from(this._edges.keys()).flatMap((source) =>
      Array.from(this._edges.get(source) || []).map((target) => [source, target] as Edge),
    );
  }

  hasEdge(edge: Edge): boolean {
    const [source, target] = edge;
    const out = this._edges.get(source) || [];
    return out.includes(target);
  }

  addEdge(edge: Edge): void {
    const [source, target] = edge;
    const out = this._edges.get(source) || [];
    out.push(target);
    this._edges.set(source, out);
  }

  addEdges(edges: Edge[]): void {
    edges.map((edge) => {
      this.addEdge(edge);
    });
  }
}
