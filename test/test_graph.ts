import Graph, { Vertex, Edge, GraphUtils } from '../graph';
import { expect } from 'chai';

describe("Graph", () => {
  let vertices: Array<Vertex> = [];
  for (let i: number = 0; i < 6; i++) {
    vertices.push(new Vertex(i));
  }
  let vertices1: Array<Vertex> = vertices.slice(0, 5);
  let vertices2: Array<Vertex> = vertices.slice(2, 6);
  let vertices3: Array<Vertex> = vertices.slice(0, 4);
  let edges1: Array<Edge> = [];
  edges1.push(new Edge(vertices[0], vertices[1]));
  edges1.push(new Edge(vertices[1], vertices[2]))
  edges1.push(new Edge(vertices[1], vertices[3]))
  edges1.push(new Edge(vertices[2], vertices[4]))
  edges1.push(new Edge(vertices[3], vertices[4]))

  let edges2: Array<Edge> = [];
  edges2.push(new Edge(vertices[2], vertices[3]))
  edges2.push(new Edge(vertices[2], vertices[4]))
  edges2.push(new Edge(vertices[3], vertices[5]))
  edges2.push(new Edge(vertices[4], vertices[5]))


  let edges3: Array<Edge> = [];
  edges3.push(new Edge(vertices[0], vertices[1]));
  edges3.push(new Edge(vertices[1], vertices[2]))
  edges3.push(new Edge(vertices[1], vertices[3]))

  const g1: Graph = new Graph(vertices1, edges1);
  const g2: Graph = new Graph(vertices2, edges2);
  const g3: Graph = new Graph(vertices3, edges3);

  it("#Basic", () => {
    expect(vertices.length).to.equal(6);
    expect(edges1.length).to.equal(5);
    expect(edges2.length).to.equal(4);
  })
  it("#Union", () => {
    const ug: Graph = GraphUtils.union(g1, g2);
    expect(ug.vertices.length).to.equal(6);
    expect(ug.edges.length).to.equal(8);
  })
  it("#Intersect", () => {
    const ig: Graph = GraphUtils.intersect(g1, g2);
    expect(ig.vertices.length).to.equal(3);
    expect(ig.edges.length).to.equal(1);
  })
  it("#Difference", () => {
    const dg: Graph = GraphUtils.diff(g1, g2);
    expect(dg.vertices.length).to.equal(2);
    expect(dg.edges.length).to.equal(1);
  })
  it("#Disjoint", () => {
    const ig: Graph = GraphUtils.intersect(g1, g2);
    expect(ig.empty()).to.equal(false);
  })
  it("#Subgraph", () => {
    const sub: Boolean = GraphUtils.subgraph(g1, g2);
    expect(sub).to.equal(false);
    const sub2: Boolean = GraphUtils.subgraph(g1, g1);
    expect(sub2).to.equal(true);
  })
  it("#Induced Subgraph", () => {
    const induced: Boolean = GraphUtils.subgraph(g1, g2);
    expect(induced).to.equal(false);
    const induced1: Boolean = GraphUtils.subgraph(g1, g1);
    expect(induced1).to.equal(true);
  })
  it("#Spanning Subgraph", () => {
    const spanning: Boolean = GraphUtils.spanningSubgraph(g1, g1);
    expect(spanning).to.equal(true);
    const nonSpan: Boolean = GraphUtils.spanningSubgraph(g3, g1);
    expect(nonSpan).to.equal(false);
  })
  it("#G - U", () => {
    const diff: Graph = GraphUtils.minusVertices(g1, vertices3);
    expect(diff.vertices.length).to.equal(1);
    expect(diff.edges.length).to.equal(0);
  })
  it("#G - E", () => {
    const r: Graph = GraphUtils.minusEdges(g1, edges3);
    expect(r.vertices.length).to.equal(5);
    expect(r.edges.length).to.equal(2);
  })
  it("#G + E", () => {
    const r: Graph = GraphUtils.plusEdges(g3, edges1);
    expect(r.vertices.length).to.equal(4);
    expect(r.edges.length).to.equal(3);
  })
  it("#G complement", () => {
    const r: Graph = GraphUtils.complement(g1);
    expect(r.vertices.length).to.equal(5);
    expect(r.edges.length).to.equal(5);
  })
  it("#Line Graph", () => {
    const r: Graph = GraphUtils.lineGraph(g1);
    expect(r.vertices.length).to.equal(5);
    expect(r.edges.length).to.equal(6);
  })
  it("#Neighbours", () => {
    const r: Array<Vertex> = GraphUtils.neighbours(g1, vertices[1]);
    expect(r.length).to.equal(3);
  })
  it("#Neighbours of Set", () => {
    const r: Array<Vertex> = GraphUtils.neighboursOfSet(g1, vertices3);
    expect(r.length).to.equal(2);
  })
  it("#Degree", () => {
    const r: number = GraphUtils.degree(g1, vertices[1]);
    expect(r).to.equal(3);
  })
  it("#Average Degree", () => {
    const r: number = GraphUtils.avgDegree(g1);
    expect(r).to.equal(2);
  })
  it("#Minium Degree", () => {
    const r: number = GraphUtils.minDegree(g1);
    expect(r).to.equal(1);
  })
  it("#Maxmium Degree", () => {
    const r: number = GraphUtils.maxDegree(g1);
    expect(r).to.equal(3);
  })
  it("#Regular", () => {
    const r: Boolean = GraphUtils.regular(g1);
    expect(r).to.equal(false);
  })
  it("#Cubic", () => {
    const r: Boolean = GraphUtils.cubic(g1);
    expect(r).to.equal(false);
  })

})