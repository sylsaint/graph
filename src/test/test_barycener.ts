import { expect } from 'chai';
import Graph, { Vertex, Edge } from '../misc/graph';
import { bc, calcTwoLevelBaryCentric } from '../algos/barycentric';

describe('BaryCentric Method', () => {
  let vertices: Array<Vertex> = [];
  const alphas: Array<string> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  alphas.map((alpha, idx) => {
    vertices.push(new Vertex(idx, { key: alpha }));
  });
  let edges: Array<Edge> = [];
  edges.push(new Edge(vertices[0], vertices[4]));
  edges.push(new Edge(vertices[0], vertices[5]));
  edges.push(new Edge(vertices[1], vertices[4]));
  edges.push(new Edge(vertices[1], vertices[7]));
  edges.push(new Edge(vertices[1], vertices[8]));
  edges.push(new Edge(vertices[2], vertices[5]));
  edges.push(new Edge(vertices[2], vertices[7]));
  edges.push(new Edge(vertices[2], vertices[8]));
  edges.push(new Edge(vertices[3], vertices[4]));
  edges.push(new Edge(vertices[3], vertices[6]));
  edges.push(new Edge(vertices[3], vertices[8]));

  const g: Graph = new Graph(vertices, edges, { directed: true });
  const ups: Array<Vertex> = vertices.slice(0, 4);
  const downs: Array<Vertex> = vertices.slice(4);

  it('Should minimize two level crossings', () => {
    const { row, col, crossCount } = calcTwoLevelBaryCentric(ups, downs, {});
    expect(row.map((v) => v.getOptions('key'))).to.deep.equal(['d', 'a', 'b', 'c']);
    expect(col.map((v) => v.getOptions('key'))).to.deep.equal(['g', 'e', 'i', 'f', 'h']);
    expect(crossCount).equal(7);
  });
  it('Should minimize two level crossings to zero', () => {
    let idx = 0;
    let ups: Vertex[] = [];
    const alphas: Array<string> = ['a', 'b', 'c'];
    alphas.map((alpha) => {
      ups.push(new Vertex(idx++, { key: alpha }));
    });
    let downs: Vertex[] = [];
    const alphaDowns = ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    alphaDowns.map((alpha) => {
      downs.push(new Vertex(idx++, { key: alpha }));
    });
    let edges: Array<Edge> = [];
    edges.push(new Edge(ups[0], downs[2]));
    edges.push(new Edge(ups[0], downs[5]));
    edges.push(new Edge(ups[0], downs[8]));
    edges.push(new Edge(ups[1], downs[1]));
    edges.push(new Edge(ups[1], downs[4]));
    edges.push(new Edge(ups[1], downs[7]));
    edges.push(new Edge(ups[2], downs[0]));
    edges.push(new Edge(ups[2], downs[3]));
    edges.push(new Edge(ups[2], downs[6]));

    const g: Graph = new Graph([...ups, ...downs], edges, { directed: true });

    const { row, col, crossCount } = calcTwoLevelBaryCentric(ups, downs, {});
    expect(row.map((v) => v.getOptions('key'))).to.deep.equal(['c', 'b', 'a']);
    expect(col.map((v) => v.getOptions('key'))).to.deep.equal(['j', 'g', 'd', 'k', 'h', 'e', 'l', 'i', 'f']);
    expect(crossCount).equal(0);
  });
});
