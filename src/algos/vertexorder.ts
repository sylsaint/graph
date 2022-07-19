export type VertexInfo = {
  outDegree: number;
  label?: number;
};

function findMaxPos(vertices: VertexInfo[]): number {
  let max = Number.NEGATIVE_INFINITY;
  let pos = -1;
  vertices.map((v, i) => {
    if (max < v.outDegree) {
      max = v.outDegree;
      pos = i;
    }
  });
  return pos;
}

// TODO: refactor to log(n) algo
function findMedian(vertices: VertexInfo[]): number {
  const vs = [...vertices];
  vs.sort((v1, v2) => v1.outDegree - v2.outDegree);
  if (vs.length % 2 === 0) {
    return (vs[vs.length / 2 - 1].outDegree + vs[vs.length / 2].outDegree) / 2;
  }
  return vs[Math.floor(vs.length / 2)].outDegree;
}

export function orderVertices(vertices: VertexInfo[], start: number, end: number): VertexInfo[] {
  console.log(vertices);
  console.log(start, end);
  if (start === end) {
    vertices[0].label = start;
    return vertices;
  }
  if (vertices.length % 2 === 0) {
    const median = findMedian(vertices);
    const down = vertices.filter((v) => v.outDegree < median);
    const upper = vertices.filter((v) => v.outDegree > median);
    const eq = vertices.filter((v) => v.outDegree === median);
    eq.map((v) => {
      if (down.length <= upper.length) {
        down.push(v);
      } else {
        upper.push(v);
      }
    });
    return [...orderVertices(upper, start, start + down.length - 1), ...orderVertices(down, start + down.length, end)];
  } else {
    const maxPos = findMaxPos(vertices);
    vertices[maxPos].label = start;
    const maxVertex = vertices.splice(maxPos, 1);
    return [...maxVertex, ...orderVertices(vertices, start + 1, end)];
  }
}
