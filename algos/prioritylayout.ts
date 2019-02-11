import Graph, { Vertex } from "../misc/graph";
import { LayoutOptions } from '../misc/interface';

const defaultOptions: LayoutOptions = {
  padding: { left: 0, right: 0, top: 0, bottom: 0 },
  width: 100,
  height: 50,
  gutter: 0
}

export function position(g: Graph, levels: Array<Array<Vertex>>, options: LayoutOptions = defaultOptions) {
  // initial horizontal position
  options = { ...defaultOptions, ...options };
  const { left, right, top, bottom } = options.padding;
  const { width, height, gutter } = options;
  levels.map((lvl, li) => {
    lvl.map((v, vi) => {
      v.setOptions('x', li);
      v.setOptions('y', vi);
      // v.setOptions('x', left + vi * (width + gutter));
      // v.setOptions('y', top + li * height);
      connectivity(v);
    })
  })
  // improve horizontal positions

}

function connectivity(v: Vertex): Vertex {
  let upConn: number = 0;
  let downConn: number = 0;
  v.edges.map(edge => {
    if (edge.up == v) downConn += 1;
    if (edge.down == v) upConn += 1;
  })
  v.setOptions('up', upConn);
  v.setOptions('down', downConn);
  return v;
}

function BikU(ups: Array<Vertex>, v: Vertex): number {
  let barycenter: number = 0;
  v.edges.map(edge => {
    if (edge.down == v) {
      const pos: number = ups.indexOf(edge.up);
      if (pos > -1) barycenter += (pos + 1) * 1;
    }
  })
  return barycenter / v.getOptions('up');
}

function BikL(downs: Array<Vertex>, v: Vertex): number {
  let barycenter: number = 0;
  v.edges.map(edge => {
    if (edge.up == v) {
      const pos: number = downs.indexOf(edge.down);
      if (pos > -1) barycenter += (pos + 1) * 1;
    }
  })
  return barycenter / v.getOptions('down');
}