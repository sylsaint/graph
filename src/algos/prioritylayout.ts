import Graph, { Vertex } from '../misc/graph';
import { LayoutOptions } from '../misc/interface';

const defaultOptions: LayoutOptions = {
  padding: { left: 0, right: 0, top: 0, bottom: 0 },
  width: 100,
  height: 50,
  gutter: 0,
};

export function position(g: Graph, levels: Array<Array<Vertex>>, options: LayoutOptions = defaultOptions): Graph {
  // initial horizontal position
  options = { ...defaultOptions, ...options };
  const { left, right, top, bottom } = options.padding;
  const { width, height, gutter } = options;
  let upMax: number = 0;
  let downMax: number = 0;
  levels.map((lvl, li) => {
    lvl.map((v, vi) => {
      v.setOptions('x', vi + 1);
      v.setOptions('y', li + 1);
      // v.setOptions('x', left + vi * (width + gutter));
      // v.setOptions('y', top + li * height);
      connectivity(v);
      if (v.getOptions('up') > upMax) upMax = v.getOptions('up');
      if (v.getOptions('down') > downMax) downMax = v.getOptions('down');
    });
  });
  levels.map(lvl => {
    lvl.map(v => {
      if (v.getOptions('type') == 'dummy') {
        // 2 is a empirical number
        v.setOptions('upPriority', upMax * 2);
        v.setOptions('downPriority', downMax * 2);
      }
    });
  });
  // improve horizontal positions
  // down procedure
  for (let i: number = 0; i < levels.length - 1; i++) {
    const ups: Array<Vertex> = levels[i];
    const downs: Array<Vertex> = levels[i + 1];
    let posMap: object = {};
    downs.map(v => {
      const bary: number = BikU(ups, v);
      // if bary is NaN, position to original place
      if (isNaN(bary)) {
        if (!posMap[v.getOptions('x')]) {
          v.setOptions('x', v.getOptions('x'));
          posMap[v.getOptions('x')] = v;
        } else {
          v.setOptions('x', v.getOptions('x') + 1);
          posMap[v.getOptions('x')] = v;
        }
      } else {
        const newPos: number = parseInt(Math.ceil(bary).toString());
        let pointer: number = newPos + 1;
        let dis: number = newPos;
        if (!posMap[newPos]) {
          v.setOptions('x', newPos);
          posMap[newPos] = v;
        } else {
          let canDisplace: boolean = false;
          while (pointer--) {
            if (posMap[pointer]) {
              if (posMap[pointer].getOptions('upPriority') >= v.getOptions('upPriority')) {
                canDisplace = false;
                break;
              }
            } else if (pointer > 0) {
              canDisplace = true;
              break;
            }
          }
          if (canDisplace) {
            while (dis > pointer) {
              let origVertex: Vertex = posMap[dis] as Vertex;
              origVertex.setOptions('x', origVertex.getOptions('x') - 1);
              dis--;
              posMap[dis] = origVertex;
            }
            v.setOptions('x', newPos);
            posMap[newPos] = v;
          } else {
            v.setOptions('x', newPos + 1);
            posMap[newPos + 1] = v;
          }
        }
      }
    });
  }
  // up procedure
  for (let i: number = levels.length - 1; i > 0; i--) {
    const downs: Array<Vertex> = levels[i];
    const ups: Array<Vertex> = levels[i - 1];
    let posMap: object = {};
    ups.map(v => {
      const bary: number = BikL(downs, v);
      // if bary is NaN, position to original place
      if (isNaN(bary)) {
        if (!posMap[v.getOptions('x')]) {
          v.setOptions('x', v.getOptions('x'));
          posMap[v.getOptions('x')] = v;
        } else {
          v.setOptions('x', v.getOptions('x') + 1);
          posMap[v.getOptions('x')] = v;
        }
      } else {
        const newPos: number = parseInt(Math.ceil(bary).toString());
        let pointer: number = newPos + 1;
        let dis: number = newPos;
        if (!posMap[newPos]) {
          v.setOptions('x', newPos);
          posMap[newPos] = v;
        } else {
          let canDisplace: boolean = false;
          while (pointer--) {
            if (posMap[pointer]) {
              if (posMap[pointer].getOptions('downPriority') >= v.getOptions('downPriority')) {
                canDisplace = false;
                break;
              }
            } else if (pointer > 0) {
              canDisplace = true;
              break;
            }
          }
          if (canDisplace) {
            while (dis > pointer) {
              let origVertex: Vertex = posMap[dis] as Vertex;
              origVertex.setOptions('x', origVertex.getOptions('x') - 1);
              dis--;
              posMap[dis] = origVertex;
            }
            v.setOptions('x', newPos);
            posMap[newPos] = v;
          } else {
            v.setOptions('x', newPos + 1);
            posMap[newPos + 1] = v;
          }
        }
      }
    });
  }
  g.vertices.map(v => {
    v.setOptions('x', left + (v.getOptions('x') - 1) * (width + gutter));
    v.setOptions('y', top + (v.getOptions('level') - 1) * (height + gutter));
  })
  return g;
}

function connectivity(v: Vertex): Vertex {
  let upConn: number = 0;
  let downConn: number = 0;
  v.edges.map(edge => {
    if (edge.up == v) downConn += 1;
    if (edge.down == v) upConn += 1;
  });
  v.setOptions('up', upConn);
  v.setOptions('down', downConn);
  v.setOptions('upPriority', upConn);
  v.setOptions('downPriority', downConn);
  return v;
}

function BikU(ups: Array<Vertex>, v: Vertex): number {
  let barycenter: number = 0;
  v.edges.map(edge => {
    if (edge.down == v) {
      const pos: number = edge.up.getOptions('x') || ups.indexOf(edge.up) + 1;
      if (pos > -1) barycenter += pos * 1;
    }
  });
  return barycenter / v.getOptions('up');
}

function BikL(downs: Array<Vertex>, v: Vertex): number {
  let barycenter: number = 0;
  v.edges.map(edge => {
    if (edge.up == v) {
      const pos: number = edge.down.getOptions('x') || downs.indexOf(edge.down) + 1;
      if (pos > -1) barycenter += pos * 1;
    }
  });
  return barycenter / v.getOptions('down');
}
