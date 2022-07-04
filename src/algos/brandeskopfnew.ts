import Graph, { Vertex, Edge } from '../misc/graph';
import { LayoutOptions, BKOptions } from '../misc/interface';
import { defaultOptions, LEFT, RIGHT, UPPER, LOWER, DUMMY, PY } from '../misc/constant';
import { range } from '../misc/misc';

// 开始重构

function addPos(levels: Vertex[][]) {
  levels.map((vertices) => vertices.map((v, i) => v.setOptions('pos', i)));
}

function getPos(vertex: Vertex, vertices: Vertex[], reversed = false): number {
  if (reversed) return vertices.length - vertex.getOptions('pos') - 1;
  return vertex.getOptions('pos');
}

function getDownMedianNeighborPos(vertex: Vertex, min: number): number {
  const neighbors = vertex.edges.filter((edge) => edge.up.id === vertex.id).map((edge) => edge.down);
  const highs = neighbors.filter(v => v.getOptions('pos') >= min);
  if (highs.length) return highs[0].getOptions('pos');
  if (neighbors.length) return neighbors[0].getOptions('pos');
  return -1; 
}

function getConfictKey(from: Vertex, to: Vertex, reversed = false) {
  if (reversed) return `${to.id}_|_${from.id}`;
  return `${from.id}_|_${to.id}`;
}

function markVertexCoflict(
  left: Vertex,
  right: Vertex,
  k0: number,
  k1: number,
  conflictResult: ConflictResult,
): ConflictResult {
  const downVertices = left.edges.filter((edge) => edge.up.id === left.id).map((edge) => edge.down);
  const crossed = downVertices.filter((vertex) => {
    const pos = vertex.getOptions('pos');
    return (pos < k0 || pos > k1);
  });
  crossed.map((v) => {
    conflictResult[getConfictKey(left, v)] = true;
  });
  return conflictResult;
}

export type ConflictResult = {
  [key: string]: boolean;
};

export function markConflicts(
  levels: Vertex[][],
): ConflictResult {
  // add pos to every vertex
  addPos(levels);
  const conflictResult: ConflictResult = {};
  // mark type 0, 1, 2 conflicts in linear time
  const verticalDepth = levels.length;
  for (let i = 0; i < verticalDepth - 1; i++) {
    const horizonWidth = levels[i].length;
    const vertices = levels[i];
    let k0 = 0,
      k1 = levels[i+1].length - 1,
      l0 = 0;
    for (let l1 = 1; l1 < horizonWidth; l1++) {
      k1 = getDownMedianNeighborPos(vertices[l1], k0);
      if (k1 === -1) continue;
      if (k1 < k0) k1 = k0;
      for (; l0 <= l1; l0++) {
        markVertexCoflict(vertices[l0], vertices[l1], k0, k1, conflictResult);
      }
      k0 = k1;
    }
  }
  return conflictResult;
}

function getUpperMedianNeighbors(vertex: Vertex, verticalOrder = true): Vertex[] {
  let upperNeighbours = vertex.edges.filter((edge) => edge.up.id === vertex.id).map((edge) => edge.down);
  if (!verticalOrder)
    upperNeighbours = vertex.edges.filter((edge) => edge.down.id === vertex.id).map((edge) => edge.up);
  const upperLength = upperNeighbours.length;
  if (upperLength === 0) return [];
  if (upperLength % 2 === 1) return [upperNeighbours[(upperLength - 1) / 2]];
  return [upperNeighbours[upperLength / 2 - 1], upperNeighbours[upperLength / 2]];
}

export type AlignOptions = {
  conflicts: ConflictResult;
  root?: { [key: number | string]: number | string };
  align?: { [key: number | string]: number | string };
  horizonOrder?: boolean;
  verticalOrder?: boolean;
};

export type AlignResult = {
  root: { [key: number | string]: number | string };
  align: { [key: number | string]: number | string };
};

export function alignVertices(
  levels: Vertex[][],
  { root = {}, align = {}, horizonOrder = true, verticalOrder = true, conflicts }: AlignOptions,
): AlignResult {
  const reorderedLevels = [...levels];
  if (Object.keys(root).length === 0) {
    levels
      .flatMap((vertices) => vertices)
      .map((v) => {
        root[v.id] = v.id;
        align[v.id] = v.id;
      });
  }
  if (verticalOrder) {
    reorderedLevels.reverse();
  }
  if (!horizonOrder) {
    // console.log(reorderedLevels.map(vertices => vertices.map(v => v.id).join(',')).join('\n'));
    reorderedLevels.map((vertices) => vertices.reverse());
    // console.log(reorderedLevels.map(vertices => vertices.map(v => v.id).join(',')).join('\n'));
  }
  for (let vi = 1; vi < reorderedLevels.length; vi++) {
    let r = 0;
    for (let hi = 0; hi < reorderedLevels[vi].length; hi++) {
      const vertex = reorderedLevels[vi][hi];
      const upperNeighbours = getUpperMedianNeighbors(vertex, verticalOrder);
      upperNeighbours.map((um) => {
        const posUm = getPos(um, reorderedLevels[vi - 1], !horizonOrder);
        if (align[vertex.id] === vertex.id && !conflicts[getConfictKey(um, vertex)] && r < posUm) {
          align[um.id] = vertex.id;
          root[vertex.id] = root[um.id];
          align[vertex.id] = root[vertex.id];
          r = posUm;
        }
      });
    }
  }

  return { root, align };
}

export function brandeskopf(levels: Vertex[][]) {
  const conflicts = markConflicts(levels);
  let root: { [key: string | number]: string | number } = {};
  let align: { [key: string | number]: string | number } = {};
  [true, false].map((verticalOrder) => {
    [true, false].map((horizonOrder) => {
      const { root: nextRoot, align: nextAlign } = alignVertices(levels, {
        root,
        align,
        conflicts,
        verticalOrder,
        horizonOrder,
      });
      root = nextRoot;
      align = nextAlign;
    });
  });
}
