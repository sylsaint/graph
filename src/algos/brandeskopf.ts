import Graph, { Vertex, Edge } from '../misc/graph';
import { LayoutOptions, BKOptions } from '../misc/interface';
import { defaultOptions, LEFT, RIGHT, UPPER, LOWER, DUMMY, PY } from '../misc/constant';
import { range } from '../misc/misc';

/*
* Based on Ulrik Brandes and Boris Kopf paper "Fast and Simple Horizontal Coordinate Assignment"
*/
export function position(g: Graph, levels: Array<Array<Vertex>>, options: LayoutOptions = defaultOptions): Graph {
  // initial horizontal position
  options = { ...defaultOptions, ...options };
  preprocess(levels);
  type1Conflicts(levels);
  const xss: object = {};
  for (let h of [LEFT, RIGHT]) {
    for (let v of [UPPER, LOWER]) {
      const transformed = transformLayers(levels, v, h);
      preprocess(transformed);
      const bkOptions: BKOptions = verticalAlignment(transformed, v);
      const { root, align } = bkOptions;
      const xs: object = horizontalCompaction(transformed, bkOptions, options, h);
      xss[`${h}-${v}`] = xs;
    }
  }
  return balance(g, xss, options);
}

function transformLayers(levels: Array<Array<Vertex>>, vertical: string, horizon: string): Array<Array<Vertex>> {
  let transformed: Array<Array<Vertex>> = [...levels];
  if (vertical === LOWER) {
    transformed = transformed.reverse();
  }
  if (horizon === RIGHT) {
    transformed = transformed.map(vertices => {
      const rt: Array<Vertex> = [...vertices.reverse()];
      vertices.reverse();
      return rt;
    });
  }
  return transformed;
}

function preprocess(levels: Array<Array<Vertex>>) {
  levels.map((level, h) => {
    level.map((v, idx) => {
      v.setOptions('order', idx);
      v.setOptions(PY, h);
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

function verticalAlignment(levels: Array<Array<Vertex>>, vertical: string): BKOptions {
  const root: object = {};
  const align: object = {};
  levels.map(vs => {
    vs.map(v => {
      root[v.id] = v.id;
      align[v.id] = v.id;
    });
  });
  levels.map((vertices, i) => {
    let r: number = -1;
    vertices.map((vki, k) => {
      const neighbours: Array<[Vertex, Edge]> = getLayeredNeighbours(vki, vertical);
      if (!neighbours.length) return;
      let floor: number = Math.floor((neighbours.length + 1) / 2) - 1;
      let ceil: number = Math.ceil((neighbours.length + 1) / 2) - 1;
      const mrange = range(floor, ceil);
      mrange.map(m => {
        if (align[vki.id] === vki.id) {
          const neighbour: [Vertex, Edge] = neighbours[m];
          const um: Vertex = neighbour[0];
          const edge: Edge = neighbour[1];
          const pos: number = getPos(um);
          const rpos: boolean = r < pos;
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
function horizontalCompaction(levels: Array<Array<Vertex>>, bkOptions: BKOptions, options: LayoutOptions, horizon: string): object {
  const { root } = bkOptions;
  const sink: object = {};
  const shift: object = {};
  const xcoordinate: object = {};
  levels.map(vertices => {
    vertices.map(v => {
      sink[v.id] = v.id;
      shift[v.id] = Number.POSITIVE_INFINITY;
    });
  });
  bkOptions.shift = shift;
  bkOptions.sink = sink;
  placeBlock(levels, bkOptions, options, xcoordinate);
  // calculate absolute position
  const xs: object = {};
  levels.map(vertices => {
    vertices.map(v => {
      xs[v.id] = xcoordinate[root[v.id]];
      if (shift[sink[root[v.id]]] < Number.POSITIVE_INFINITY) {
        xs[v.id] = xs[v.id] + shift[sink[root[v.id]]];
      }
    })
  })
  if (horizon === RIGHT) {
    return reversePos(xs);
  }
  return xs;
}

function placeBlock(levels: Array<Array<Vertex>>, bkOptions: BKOptions, options: LayoutOptions, xcoordinate: object) {
  // place block
  // modified version of original without recursion
  // find largest width of levels
  const { sink, shift, root, align } = bkOptions;
  const { delta } = options;
  for (let v = 0; v < levels.length; v++) {
    for (let h = 0; h < levels[v].length; h++) {
      const vx: Vertex = levels[v][h];
      const vrid: any = root[vx.id];
      if (xcoordinate[vrid] === undefined) {
        xcoordinate[vrid] = 0;
      }
      if (h > 0) {
        const pred: Vertex = levels[v][h - 1];
        const urid: any = root[pred.id];
        if (sink[vrid] === vrid) sink[vrid] = sink[urid];
        if (sink[vrid] !== sink[urid]) {
          shift[sink[urid]] = Math.min(shift[sink[urid]], xcoordinate[vrid] - xcoordinate[urid] - delta);
        } else {
          xcoordinate[vrid] = Math.max(xcoordinate[vrid], xcoordinate[urid] + delta);
        }
      }
    }
  }
}

function findSmallestWidth(xss: object): number {
  let smallestWidth: number = Number.POSITIVE_INFINITY;
  let align: string = '';
  for (let h of [LEFT, RIGHT]) {
    for (let v of [UPPER, LOWER]) {
      const xs: object = xss[`${h}-${v}`];
      const width: number = Math.max.apply(null, Object.keys(xs).map(key => xs[key]));
      if (width < smallestWidth) {
        smallestWidth = width;
        align = h;
      }
    }
  }
  return smallestWidth;
}

function reversePos(xs: object): object {
  let max: number = 0;
  const rt: object = {};
  Object.keys(xs).map(key => {
    if (xs[key] > max) max = xs[key];
  });
  Object.keys(xs).map(key => {
    rt[key] = max - xs[key];
  });
  return rt;
}

function balance(g: Graph, xss: object, options: LayoutOptions): Graph {
  const { width, height, gutter, padding } = options;
  const { left, top } = padding;
  g.vertices.map(v => {
    const posList: Array<number> = Object.keys(xss).map(key => xss[key][v.id]).sort();
    const xs: number = (posList[1] + posList[2]) / 2;
    v.setOptions('x', left + xs * (width + gutter));
    v.setOptions('y', top + v.getOptions(PY) * (height + gutter));
    v.removeOptions(PY);
    v.removeOptions('order');
    v.removeOptions('conflict');
  });
  return g;
}