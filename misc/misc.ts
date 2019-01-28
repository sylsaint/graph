import { Vertex } from './graph';

export function edgeMatrix(ups: Array<Vertex>, downs: Array<Vertex>): Array<Array<number>> {
  let em: Array<Array<any>> = [];
  ups.map((up, i) => {
    em[i] = [];
    downs.map((down, j) => {
      if (hasEdge(up, down)) em[i][j] = 1;
      else em[i][j] = 0;
    })
  })
  return em;
}

function hasEdge(from: Vertex, to: Vertex): boolean {
  let exist: boolean = false;
  from.edges.map(edge => {
    if (edge.down == to) exist = true;
  })
  return exist;
}