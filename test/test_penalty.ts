import { expect } from 'chai';
import Graph, { Vertex, Edge } from '../misc/graph';
import { kosaraju } from '../algos/kosaraju';

describe("Penalty", () => {
  let vertices: Array<Vertex> = [];
  for (let i: number = 0; i < 8; i++) {
    vertices.push(new Vertex(i));
  }
  for (let i: number = 8; i < 16; i++) {
    vertices.push(new Vertex(i));
  }
  // a, b, c, d, e, f, g, h
  // 8, 9, 10,11,12,13,14,15
  let edges: Array<Edge> = [];
  edges.push(new Edge(vertices[0], vertices[10]));
  edges.push(new Edge(vertices[0], vertices[11]));
  edges.push(new Edge(vertices[0], vertices[12]));
  edges.push(new Edge(vertices[0], vertices[15]));
  edges.push(new Edge(vertices[1], vertices[10]));
  edges.push(new Edge(vertices[1], vertices[12]));
  edges.push(new Edge(vertices[2], vertices[8]));
  edges.push(new Edge(vertices[2], vertices[12]));
  edges.push(new Edge(vertices[2], vertices[13]));
  edges.push(new Edge(vertices[2], vertices[15]));
  edges.push(new Edge(vertices[3], vertices[12]));
  edges.push(new Edge(vertices[4], vertices[10]));
  edges.push(new Edge(vertices[4], vertices[14]));
  edges.push(new Edge(vertices[5], vertices[13]));
  edges.push(new Edge(vertices[6], vertices[9]));
  edges.push(new Edge(vertices[6], vertices[11]));
  edges.push(new Edge(vertices[7], vertices[9]));
  edges.push(new Edge(vertices[7], vertices[13]));
  edges.push(new Edge(vertices[7], vertices[14]));

  const g: Graph = new Graph(vertices, edges, { directed: true });

  it("#SCC - kosaraju", () => {
    expect(vertices.length).to.equal(5);
    expect(edges.length).to.equal(5);
    const tree: any = kosaraju(g);
  })
})