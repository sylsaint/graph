import Graph, { Vertex, Edge } from "../misc/graph";
import { kosaraju } from "./kosaraju";
import { penaltyGraph } from "../misc/penaltyGraph";

export function pm(sccs: Array<Array<Vertex>>) {
  sccs.map(scc => {
    if (scc.length > 1) {
      const cycles: Array<Array<Edge>> = findCycle(edgeMatrix(scc));
      console.log(cycles);
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

function absorption(left: Array<Edge>, right: Array<Edge>) {

}

