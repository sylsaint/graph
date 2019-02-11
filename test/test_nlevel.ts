import { expect } from "chai";
import Graph, { Vertex, Edge } from "../misc/graph";
import { crossCount } from "../misc/penaltyGraph";
import { penaltyMethod } from '../algos/penaltymethod';

describe("N-Level", () => {
  let vertices: Array<Vertex> = [];
  let alpha: Array<string> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  for (let i: number = 0; i < 12; i++) {
    vertices.push(new Vertex(i));
  }
  // a, b, c, d, e, f, g, h, i, j,  k,  l
  // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
  let edges: Array<Edge> = [];
  edges.push(new Edge(vertices[0], vertices[4]));
  edges.push(new Edge(vertices[1], vertices[3]));
  edges.push(new Edge(vertices[2], vertices[3]));
  edges.push(new Edge(vertices[3], vertices[6]));
  edges.push(new Edge(vertices[4], vertices[6]));
  edges.push(new Edge(vertices[4], vertices[7]));
  edges.push(new Edge(vertices[4], vertices[8]));
  edges.push(new Edge(vertices[5], vertices[7]));
  edges.push(new Edge(vertices[6], vertices[11]));
  edges.push(new Edge(vertices[7], vertices[9]));
  edges.push(new Edge(vertices[7], vertices[10]));

  const g: Graph = new Graph(vertices, edges, { directed: true });
  let nLevels: Array<Array<Vertex>> = [];
  for (let i: number = 0; i < 12; i += 3) {
    nLevels.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
  }

  it("#origin cross count", () => {
    let totalCount: number = 0;
    for (let i: number = 0; i < nLevels.length - 1; i++) {
      totalCount += crossCount(nLevels[i], nLevels[i + 1]);
    }
    expect(vertices.length).to.equal(12);
    expect(edges.length).to.equal(11);
    expect(totalCount).to.equal(5);
  });
  it("#reduced cross count", () => {
    const rt: Array<Array<Vertex>> = penaltyMethod(g, nLevels);
    let totalCount: number = 0;
    for (let i: number = 0; i < rt.length - 1; i++) {
      console.log(rt[i].map(v => alpha[v.id]).join(','));
      totalCount += crossCount(rt[i], rt[i + 1]);
    }
    console.log(rt[rt.length - 1].map(v => alpha[v.id]).join(','));
    console.log(totalCount);
  });
});
