import { Vertex, Edge } from './graph';

export function dagShortestPath(start: Vertex, end: Vertex): number {
  const sorted: Vertex[] = [];
  const visited: { [key: number]: boolean } = {};
  const neighboursMap: { [key: number]: Edge[] } = {};
  const vertexStack: Vertex[] = [start];
  const idToOrderMap: { [key: number]: number } = {};
  while (vertexStack.length) {
    const vt: Vertex = vertexStack.pop() as Vertex;
    if (visited[vt.id]) continue;
    if (!neighboursMap[vt.id]) neighboursMap[vt.id] = [...vt.edges];
    if (neighboursMap[vt.id].length === 0) {
      sorted.push(vt);
      visited[vt.id] = true;
    } else {
      const edge: Edge = neighboursMap[vt.id].splice(0, 1)[0];
      vertexStack.push(vt);
      vertexStack.push(edge.to as Vertex);
    }
  }
  sorted.reverse();
  const dist: number[] = new Array(sorted.length);
  sorted.forEach((v, idx) => idToOrderMap[v.id] = idx);
  sorted.forEach(v => {
    if (v.id === start.id) {
      dist[idToOrderMap[v.id]] = 0;
      return;
    }
    const currentOrder: number = idToOrderMap[v.id];
    v.edges.forEach(edge => {
      const order: number = idToOrderMap[(edge.to as Vertex).id];
      if (!dist[order] || dist[order] > dist[currentOrder] + edge.weight) {
        dist[order] = dist[currentOrder] + edge.weight;
      }
    })
  }) 
  if (idToOrderMap[end.id]) {
    return dist[idToOrderMap[end.id]];
  }
  return Number.POSITIVE_INFINITY;
}
