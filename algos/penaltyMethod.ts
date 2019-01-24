import Graph, { Vertex, Edge } from "../misc/graph";
import { kosaraju } from "./kosaraju";
import { penaltyGraph } from "../misc/penaltyGraph";
import { kahn } from './topological';
import { printVertexNeighbours } from "../misc/graphUtil";

export function pm(sccs: Array<Array<Vertex>>, g: Graph) {
  sccs.map(scc => {
    if (scc.length > 1) {
      const cycles: Array<Array<Edge>> = findCycle(edgeMatrix(scc));
      console.log(cycles);
      const reduced: Array<any> = reduceSummands(cycles);
      console.log(reduced);
      sortVertices(g, reduced);
    }
  })
}

// n x n matrix
function edgeMatrix(scc: Array<Vertex>): Array<Array<any>> {
  let em: Array<Array<any>> = [];
  scc.map((v, i) => {
    em[i] = [];
    scc.map((vd, vi) => {
      let found: boolean = false;
      v.edges.map(edge => {
        if (edge.up == v && edge.down == vd && edge.up != edge.down) {
          found = true;
          em[i].push(edge);
        }
      })
      if (!found) em[i].push(0);
    })
  })
  return em;
}

// find all the cycles in the scc
function findCycle(matrix: Array<Array<any>>, rowIdx: number = 0): Array<Array<Edge>> {
  let cycles: Array<Array<Edge>> = [];
  matrix[rowIdx].map((mi, idx) => {
    if (mi && idx === 0) {
      cycles.push([mi]);
    } else if (mi) {
      let subCycles: Array<Array<Edge>> = findCycle(matrix, idx);
      subCycles.map(cycle => {
        let rt: Array<Edge> = [mi as Edge];
        cycle.map(edge => rt.push(edge));
        cycles.push(rt);
      })
    }
  })
  return cycles;
}

function reduceSummands(cycles: Array<Array<Edge>>): Array<any> {
  let reduced: Array<any> = [];
  cycles.map(cycle => {
    reduced = absorpt(reduced, cycle);
  })
  return reduced;
}

function absorpt(xs: Array<any>, ys: Array<Edge>): Array<any> {
  let zs: Array<any> = [];
  if (xs.length === 0) {
    return ys.slice();
  }
  xs.map(x => {
    if (x instanceof Edge) {
      const rt: Edge | boolean = absorpt1(x, new Sum(ys));
      if (rt == false) {
        ys.map(y => {
          zs.push(new Prod([x, y]));
        })
      } else {
        zs.push(x);
      }
    }
    if (x instanceof Prod) {
      let found: boolean = false;
      ys.map(y => {
        // Here we use absorpt1 rule implicitly 
        if (x.has(y)) found = true;
      })
      if (found) {
        zs.push(x);
      } else {
        ys.map(y => {
          zs.push(new Prod([].concat(x.edges).concat([y])));
        })
      }
    }
  })
  let exclude: Array<Prod> = [];
  let edges: Array<Edge> = [];
  let prods: Array<Prod> = [];
  zs.map(z => {
    if (z instanceof Edge) edges.push(z);
    else prods.push(z);
  })
  prods.map(prod => {
    edges.map(edge => {
      if (absorpt2(edge, prod)) exclude.push(prod);
    })
  })
  prods.map(p1 => {
    let needEx: boolean = false;
    prods.map(p2 => {
      if (isSubset(p2, p1) && !isEqual(p1, p2)) needEx = true;
    })
    if (needEx) exclude.push(p1);
  })

  return zs.filter(z => {
    return exclude.indexOf(z) < 0;
  }).sort((a, b) => {
    if (a instanceof Edge) {
      return -1;
    }
    if (a instanceof Prod && b instanceof Edge) {
      return 1;
    }
    if (a instanceof Prod && b instanceof Prod) {
      return a.count < b.count ? -1 : a.count == b.count ? 0 : 1;
    }
  });
}

class BaseContainer {
  private _edges: Array<Edge> = [];
  constructor(edges: Array<Edge>) {
    this._edges = edges.slice();
  }
  get edges(): Array<Edge> {
    return this._edges;
  }
  has(edge: Edge): boolean {
    return this._edges.indexOf(edge) > -1;
  }
  get count(): number {
    return this._edges.length;
  }
}

class Prod extends BaseContainer {
  constructor(edges: Array<Edge>) {
    super(edges);
  }
}
class Sum extends BaseContainer {
  constructor(edges: Array<Edge>) {
    super(edges);
  }
}


// boolean algebra absorption rules
// x ^ (x v y) = x
function absorpt1(x: Edge, y: Sum): Edge | boolean {
  if (y.has(x)) return x;
  else return false;
}

// x v (x ^ y) = x
function absorpt2(x: Edge, y: Prod): Edge | boolean {
  if (y.has(x)) return x;
  else return false;
}

// judge the relation between Prods and Edges

// subset
function isSubset(x: Prod, y: Prod): boolean {
  let subset: boolean = true;
  x.edges.map(edge => {
    if (!y.has(edge)) subset = false;
  })
  return subset;
}

// equal
function isEqual(x: Prod, y: Prod): boolean {
  let equal: boolean = true;
  if (x.edges.length != y.edges.length) {
    equal = false;
  } else {
    equal = isSubset(x, y) && isSubset(y, x);
  }

  return equal;
}

function sortVertices(G: Graph, arcs: Array<any>) {
  let fst: any = arcs[0];
  if (fst instanceof Edge) {
    const g: Graph = reverseGraph(G, [fst as Edge])
    const sorted: Array<Vertex> = kahn(g);
    console.log(sorted);
  }
}

function reverseGraph(g: Graph, edges: Array<Edge>): Graph {
  edges.map(edge => {
    console.log(edge);
    edge.up.edges.map(edge => {
      console.log(edge);
    })
    if (g.hasEdge(edge)) {
      const tmp: Vertex = edge.up;
      edge.up = edge.down;
      edge.down = tmp;
    }
    console.log(edge);
  })
  return g;
}