import Graph, { Vertex, Edge } from './graph';

function penalty(u: Vertex, v: Vertex, nLevel: Array<Vertex>): number {
  return cross(v, u, nLevel) - cross(u, v, nLevel);
}

function cross(u: Vertex, v: Vertex, nLevel: Array<Vertex>): number {
  let crossCnt: number = 0;
  u.edges.map(ue => {
    if (ue.up == u) {
      v.edges.map(ve => {
        if (ve.up == v) {
          if (nLevel.indexOf(ue.down) > nLevel.indexOf(ve.down)) crossCnt++;
        }
      })
    }
  })
  return crossCnt;
}

function combinatorN2(vertices: Array<Vertex>): Array<Array<Vertex>> {
  let combineList: Array<Array<Vertex>> = [];
  for (let fst: number = 0; fst < vertices.length - 1; fst++) {
    for (let snd: number = fst + 1; snd < vertices.length; snd++) {
      combineList.push([vertices[fst], vertices[snd]]);
    }
  }
  return combineList;
}

/*
* penalty graph: H = (W, F, p)
* W = V1
* F = {(u, v) \in W X W | cross(r(u), r(v)) < cross(r(v), r(u))}
* N = {1,2, ...}
* p: F -> N
*/
export function penaltyGraph(W: Array<Vertex>, nLevel: Array<Vertex>): Graph {
  let pg: Graph = new Graph(W, [], { directed: true });
  let combineList: Array<Array<Vertex>> = combinatorN2(W);
  combineList.map(vec => {
    if (penalty(vec[0], vec[1], nLevel) > 0) {
      pg.addEdge(new Edge(vec[0], vec[1]));
    } else if (penalty(vec[0], vec[1], nLevel) < 0) {
      pg.addEdge(new Edge(vec[1], vec[0]));
    }
  })
  return pg;
}