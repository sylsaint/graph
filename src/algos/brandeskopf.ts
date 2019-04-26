import Graph, { Vertex, Edge } from '../misc/graph';
import { LayoutOptions, BKOptions } from '../misc/interface';
import { defaultOptions, LEFT, RIGHT, UPPER, LOWER, DUMMY } from '../misc/constant';
import { range } from '../misc/misc';

/*
* Based on Ulrik Brandes and Boris Kopf paper "Fast and Simple Horizontal Coordinate Assignment"
*/
export function position(g: Graph, levels: Array<Array<Vertex>>, options: LayoutOptions = defaultOptions): Graph {
  // initial horizontal position
  options = { ...defaultOptions, ...options };
  const { left, right, top, bottom } = options.padding;
  const { width, height, gutter } = options;
  console.log('preprocess...');
  preprocess(levels);
  console.log('type 1 conflicts...');
  type1Conflicts(levels);
  console.log('vertical alignment...');
  for (let h of [LEFT, RIGHT]) {
    for (let v of [UPPER, LOWER]) {
      console.log('alignment: ', h, v);
      const { root, align } = verticalAlignment(levels, v, h);
      console.log(root);
    }
  }
  return g;
}

function preprocess(levels: Array<Array<Vertex>>) {
  levels.map(level => {
    level.map((v, idx) => {
      v.setOptions('order', idx);
      v.setOptions('predecessor', level[idx - 1]);
      v.setOptions('successor', level[idx + 1]);
    });
  });
}

/*
* Type 1 conflicts arise when a non-inner segment crosses an inner segment.
* Again because vertical inner segments are preferable, they are resolved in favor
* of the inner segment. The algorithm traverses layers from left to right (index l) while
* maintaining the upper neighbors, v(i)^k0 and v(i)^k1 , of the two closest inner segments.
*/
function type1Conflicts(levels: Array<Array<Vertex>>) {
  const ht: number = levels.length;
  for (let i: number = 1; i < ht - 1; i++) {
    let k0: number = 0, l: number = 1;
    const wh: number = levels[i + 1].length;
    for (let l1: number = 0; l1 < wh; l1++) {
      const vn: Vertex = levels[i + 1][l1];
      let mark: boolean = false;
      let k1: number = levels[i].length - 1;
      if (l1 === wh - 1) {
        mark = true;
      }
      if (hasInnerSegment(vn)) {
        mark = true;
        const vu: Vertex = getUpper(vn);
        if (vu.id > 0) {
          k1 = getPos(vu);
        }
      }
      if (mark) {
        while (l <= l1) {
          const vl: Vertex = levels[i + 1][l];
          upperNeighbours(vl).map(ve => {
            const k: number = getPos(ve[0]);
            if (k < k0 || k > k1) ve[1].setOptions('conflict', true);
          });
          l += 1;
        }
        k0 = k1;
      }
    }
  }
}

function isDummyNode(v: Vertex): boolean {
  return v.getOptions('type') === DUMMY;
}

function hasInnerSegment(vn: Vertex): boolean {
  if (!isDummyNode(vn)) return false;
  let inner: boolean = false;
  const edges: Array<Edge> = vn.edges;
  edges.map(edge => {
    if (edge.down === vn && isDummyNode(edge.up)) {
      inner = true;
    }
  })
  return inner;
}

function getUpper(v: Vertex): Vertex {
  let upper: Vertex = new Vertex(-1);
  const edges: Array<Edge> = v.edges;
  edges.map(edge => {
    if (edge.down === v) {
      upper = edge.up;
    }
  });
  return upper;
}

function getPos(v: Vertex): number {
  return v.getOptions('order');
}

function upperNeighbours(vn: Vertex): Array<[Vertex, Edge]> {
  const edges: Array<Edge> = vn.edges;
  const ups: Array<[Vertex, Edge]> = [];
  edges.map(edge => {
    if (edge.down === vn) {
      ups.push([edge.up, edge]);
    }
  })
  return ups;
}

function lowerNeighbours(vn: Vertex): Array<[Vertex, Edge]> {
  const edges: Array<Edge> = vn.edges;
  const downs: Array<[Vertex, Edge]> = [];
  edges.map(edge => {
    if (edge.up === vn) {
      downs.push([edge.down, edge]);
    }
  })
  return downs;
}

function getLayeredNeighbours(v: Vertex, upOrDown: string): Array<[Vertex, Edge]> {
  if (upOrDown === UPPER) return upperNeighbours(v);
  return lowerNeighbours(v);
}

/*
* Vertical Alignment
* in every layer we process the vertices from left to right and for each vertex we 
* consider its median upper neighbor (its left and right median upper neighbor, in 
* this order, if there are two). The pair is aligned, if no conflicting alignment is 
* left of this one. The resulting bias is mediated by the fact that the symmetric bias 
* is applied in one of the other three assignments.
*/

function verticalAlignment(levels: Array<Array<Vertex>>, v: string, h: string): BKOptions {
  const root: object = {};
  const align: object = {};
  levels.map(vs => {
    vs.map(v => {
      root[v.id] = v.id;
      align[v.id] = v.id;
    });
  });
  const ht: number = levels.length;
  const vstart: number = v === UPPER ? 0 : ht - 1;
  const vend: number = v === UPPER ? ht - 1 : 0;
  const vrange = range(vstart, vend);
  vrange.map(i => {
    const wd = levels[i].length;
    let r: number = h === LEFT ? -1 : wd;
    const hstart: number = h === LEFT ? 0 : wd - 1;
    const hend: number = h === LEFT ? wd - 1 : 0;
    const hrange = range(hstart, hend);
    hrange.map(k => {
      const vki: Vertex = levels[i][k];
      const neighbours: Array<[Vertex, Edge]> = getLayeredNeighbours(vki, v);
      if (!neighbours.length) return;
      let floor: number = Math.floor((neighbours.length + 1) / 2) - 1;
      let ceil: number = Math.ceil((neighbours.length + 1) / 2) - 1;
      let [mstart, mend] = h === LEFT ? [floor, ceil] : [ceil, floor];
      const mrange = range(mstart, mend);
      mrange.map(m => {
        if (align[vki.id] === vki.id) {
          const neighbour: [Vertex, Edge] = neighbours[m];
          const um: Vertex = neighbour[0];
          const edge: Edge = neighbour[1];
          const pos: number = getPos(um);
          const rpos: boolean = h === LEFT ? r < pos : r > pos;
          if (!edge.getOptions('conflict') && rpos) {
            align[um.id] = vki.id;
            root[vki.id] = root[um.id];
            align[vki.id] = root[vki.id];
            r = pos;
          }
        }
      });
    });
  });
  return { root, align, sink: {}, shift: {} };
}

/*
* horizontal compaction
*/
function horizontalCompaction(levels: Array<Array<Vertex>>, bkOptions: BKOptions, options: LayoutOptions) {
  const { root } = bkOptions;
  const sink: object = {};
  const shift: object = {};
  const xcoordinate: object = {};
  levels.map(vertices => {
    vertices.map((v, idx) => {
      sink[v.id] = v.id;
      shift[v.id] = Number.POSITIVE_INFINITY;
    })
  })
  bkOptions.shift = shift;
  bkOptions.sink = sink;
  levels.map(vertices => {
    vertices.map(v => {
      if (root[v.id] === v.id) placeBlock(v, xcoordinate, bkOptions, options);
    })
  })
  levels.map(vertices => {
    vertices.map(v => {
      xcoordinate[v.id] = xcoordinate[root[v.id]];
      if (shift[sink[root[v.id]]] < Number.POSITIVE_INFINITY) {
        xcoordinate[v.id] = xcoordinate[v.id] + shift[sink[root[v.id]]];
      }
    })
  })
}

function placeBlock(v: Vertex, x: object, bkOptions: BKOptions, options: LayoutOptions) {
  const { root, align, sink, shift } = bkOptions;
  // push vertices into stack

  if (x[v.id] === undefined) {
    x[v.id] = 0;
    let w: Vertex = v;
    do {
      if (w.getOptions('pos') > 0) {
        const u: Vertex = root[predecessor(w).id];
        placeBlock(u, x, bkOptions, options);
        if (sink[v.id] === v.id) sink[v.id] = sink[u.id];
        if (sink[v.id] !== sink[u.id]) {
          shift[sink[u.id]] = Math.min(shift[sink[u.id]], x[v.id] - x[u.id]);
        } else {
          x[v.id] = Math.max(x[v.id], x[u.id]);
        }
      }
      w = align[w.id];
    } while (w !== v);
  }
}

function predecessor(w: Vertex): Vertex {
  return w.getOptions('predecessor');
}

function successor(w: Vertex): Vertex {
  return w.getOptions('successor');
}

function balance() {

}

function findSmallestWidth() {

}

function alignCoordinate() {

}