import { Vertex } from '../misc/graph';
import { LayoutOptions } from '../misc/interface';

export type VertexIdMap = { [key: string | number]: string | number };
export type VertexIdNumberMap = { [key: string | number]: number };
export type IdVertexMap = { [key: string | number]: Vertex };

// 开始重构

function getPos(vertex: Vertex, vertices: Vertex[], reversed = false): number {
  if (reversed) return vertices.length - vertex.getOptions('pos') - 1;
  return vertex.getOptions('pos');
}

function getPrev(vertex: Vertex, reversed = false): number {
  if (reversed) return vertex.getOptions('next');
  return vertex.getOptions('prev');
}

function getDownMedianNeighborPos(vertex: Vertex, min: number): number {
  const neighbors = vertex.edges.filter((edge) => edge.up.id === vertex.id).map((edge) => edge.down);
  const highs = neighbors.filter((v) => v.getOptions('pos') >= min);
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
    return pos < k0 || pos > k1;
  });
  crossed.map((v) => {
    conflictResult[getConfictKey(left, v)] = true;
  });
  return conflictResult;
}

function preprocess(levels: Vertex[][]): IdVertexMap {
  const vertexMap: IdVertexMap = {};
  levels.map((vertices, lvl) =>
    vertices.map((v, i) => {
      // add level to every vertex
      v.setOptions('level', lvl);
      // add pos to every vertex
      v.setOptions('pos', i);
      // add prev and next to every vertex
      v.setOptions('prev', vertices[i - 1]?.id);
      v.setOptions('next', vertices[i + 1]?.id);
      // add to map
      vertexMap[v.id] = v;
    }),
  );
  return vertexMap;
}

export type ConflictResult = {
  [key: string]: boolean;
};

export function markConflicts(levels: Vertex[][]): ConflictResult {
  const conflictResult: ConflictResult = {};
  // mark type 0, 1, 2 conflicts in linear time
  const verticalDepth = levels.length;
  for (let i = 0; i < verticalDepth - 1; i++) {
    const horizonWidth = levels[i].length;
    const vertices = levels[i];
    let k0 = 0,
      k1 = levels[i + 1].length - 1,
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
  root?: Map<string | number, string | number>;
  align?: Map<string | number, string | number>;
  horizonOrder?: boolean;
  verticalOrder?: boolean;
};

export type AlignResult = {
  root: Map<string | number, string | number>;
  align: Map<string | number, string | number>;
};

export function alignVertices(
  levels: Vertex[][],
  { root = new Map(), align = new Map(), horizonOrder = true, verticalOrder = true, conflicts }: AlignOptions,
): AlignResult {
  const reorderedLevels = [...levels];
  if (root.size === 0 && align.size === 0) {
    levels
      .flatMap((vertices) => vertices)
      .map((v) => {
        root.set(v.id, v.id);
        align.set(v.id, v.id);
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
        if (align.get(vertex.id) === vertex.id) {
          if (!conflicts[getConfictKey(um, vertex)] && r < posUm) {
            align.set(um.id, vertex.id);
            root.set(vertex.id, root.get(um.id) as string | number);
            align.set(vertex.id, root.get(vertex.id) as string | number);
            r = posUm;
          }
        }
      });
    }
  }

  return { root, align };
}

export type CompactionOptions = {
  levels: Vertex[][];
  layoutOptions: Pick<LayoutOptions, 'delta'>;
  root: Map<string | number, string | number>;
  align: Map<string | number, string | number>;
  horizonOrder: boolean;
  verticalOrder: boolean;
  vertexMap?: IdVertexMap;
};

export type CompactionResult = {
  sink: VertexIdMap;
  shift: VertexIdNumberMap;
  xcoords: VertexIdNumberMap;
};

export function compaction({
  root,
  align,
  horizonOrder = true,
  verticalOrder = true,
  vertexMap = {},
  levels,
  layoutOptions,
}: CompactionOptions) {
  const sink: VertexIdMap = {};
  const shift: VertexIdNumberMap = {};
  let xcoords: VertexIdNumberMap = {};
  let selfRoot: (string | number)[] = [];
  const vertices: (string | number)[] = [];
  root.forEach((_value, key) => {
    vertices.push(key);
  });
  vertices.map((vid) => {
    sink[vid] = vid;
    shift[vid] = Number.POSITIVE_INFINITY;
    if (vid === root.get(vid)) selfRoot.push(vid);
  });

  // sort root
  const ordered: (string | number)[] = [];
  const sortMap: { [key: string | number]: (string | number)[] } = {};
  selfRoot.map((vid) => {
    const prevVid = getPrev(vertexMap[vid], !horizonOrder);
    if (prevVid !== undefined) {
      const prevRootId = root.get(prevVid) as string | number;
      if (!sortMap[prevRootId]) {
        sortMap[prevRootId] = [vid];
      } else {
        sortMap[prevRootId].push(vid);
      }
    }
  });

  while (Object.keys(sortMap).length) {
    const tails: { [key: string | number]: boolean } = {};
    selfRoot.map((vid) => {
      sortMap[vid]?.map((tid) => {
        tails[tid] = true;
      });
    });
    const heads = selfRoot.filter((vid) => !tails[vid]);
    heads.map((vid) => {
      ordered.push(vid);
      delete sortMap[vid];
    });
    selfRoot = selfRoot.filter((vid) => tails[vid]);
  }

  // root coordinates relative to sink
  ordered.map(
    (vid) =>
      (xcoords = placeBlock(vid, {
        root,
        align,
        sink,
        shift,
        xcoords,
        verticalOrder,
        horizonOrder,
        vertexMap,
        levels,
        layoutOptions,
      })),
  );

  console.log(xcoords);
  // absolute coordinates
  vertices.map((vid) => {
    xcoords[vid] = xcoords[root[vid]];
    if (shift[sink[root[vid]]] < Number.POSITIVE_INFINITY) {
      xcoords[vid] += shift[sink[root[vid]]];
    }
  });
  console.log(xcoords);
  return { sink, shift, xcoords };
}

export type BlockOptions = CompactionOptions & CompactionResult;

/**
 * @description mutant of original without recursion
 * @param v
 * @param options
 */
function placeBlock(vid: string | number, options: BlockOptions): VertexIdNumberMap {
  const { sink, shift, root, align, xcoords, vertexMap = {}, levels, horizonOrder, layoutOptions } = options;
  const { delta } = layoutOptions;
  // vertex has been handled
  if (xcoords[vid] !== undefined) {
    return xcoords;
  }
  xcoords[vid] = 0;
  let w = vid;
  do {
    const vertex = vertexMap[w];
    if (getPos(vertex, levels[vertex.getOptions('level')], !horizonOrder) === 0) {
      w = align.get(w) as string | number;
      continue;
    }
    const u = root.get(getPrev(vertex, !horizonOrder)) as string | number;
    if (sink[vid] === vid) sink[vid] = sink[u];
    if (sink[vid] !== sink[u]) {
      shift[sink[u]] = Math.min(shift[sink[u]], xcoords[vid] - xcoords[u] - delta);
    } else {
      xcoords[vid] = Math.max(xcoords[vid], xcoords[u] + delta);
    }
    w = align.get(w) as string | number;
  } while (w !== vid);
  return xcoords;
}

export function brandeskopf(levels: Vertex[][], layoutOptions: Pick<LayoutOptions, 'delta'>) {
  const vertexMap = preprocess(levels);
  const conflicts = markConflicts(levels);
  [true].map((verticalOrder) => {
    [true].map((horizonOrder) => {
      const { root, align } = alignVertices(levels, {
        conflicts,
        verticalOrder,
        horizonOrder,
      });
      const { xcoords } = compaction({ root, align, horizonOrder, verticalOrder, vertexMap, levels, layoutOptions });
      console.log(xcoords);
    });
  });
}
