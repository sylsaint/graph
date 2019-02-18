import Graph, { Vertex } from '../misc/graph';
import { LayoutOptions, VerticeMap } from '../misc/interface';
import { defaultOptions } from '../misc/constant';

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
  levels.map((lvl, li) => {
    lvl.map(v => {
      if (v.getOptions('type') == 'dummy') {
        // 2 is a empirical number
        v.setOptions('upPriority', upMax * 2 * (1+((li+1)/levels.length)));
        v.setOptions('downPriority', downMax * 2 * (1+((li+1)/levels.length)));
      }

    });
  });
  levels.map(lvl => {
    lvl.map(v => {
      if (v.getOptions('type') != 'dummy') {
          let upPrio: number = v.getOptions('upPriority');
          let setUp: boolean = false;
          let downPrio: number = v.getOptions('downPriority');
          let setDown: boolean = false;
          v.edges.map(edge => {
              if(edge.up.getOptions('type') === 'dummy') {
                setUp = true;
                upPrio = upPrio - 1 + edge.up.getOptions('upPriority') * 0.5;
              }
              if(edge.down.getOptions('type') === 'dummy') {
                setDown = true;
                downPrio = downPrio - 1 + edge.down.getOptions('downPriority') * 0.5;
              }
          })
          setUp && v.setOptions('upPriority', upPrio);
          setDown && v.setOptions('downPriority', downPrio);
      }
    });
  });
  // compact layout
  compact(levels);
  // improve horizontal positions
  // down procedure
  for (let i: number = 0; i < levels.length - 1; i++) {
    const ups: Array<Vertex> = levels[i];
    const downs: Array<Vertex> = levels[i + 1];
    doProcedure(ups, downs);
  }
  // up procedure
  for (let i: number = levels.length - 1; i > 0; i--) {
    const downs: Array<Vertex> = levels[i];
    const ups: Array<Vertex> = levels[i - 1];
    doProcedure(ups, downs, true);
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



function doProcedure(ups: Array<Vertex>, downs: Array<Vertex>, reverse: boolean = false) {
  const vertices: Array<Vertex> = reverse ? ups : downs;
  const priorityKey: string = reverse ? 'downPriority' : 'upPriority';
  vertices.map(v => {
    const bary: number = reverse ? BikL(downs, v) : BikU(ups, v);
    // if bary is NaN, do nothing 
    if (isNaN(bary)) {
      return;
    }
    const reorderPos: number = parseInt(Math.ceil(bary).toString());
    v.setOptions('x', reorderPos);
  });
  const posList: Array<Vertex> = [];
  let maxPos: number = 0;
  vertices.map(v => {
    const pos: number = v.getOptions('x');
    if (pos > maxPos) {
      maxPos = pos;
      posList[pos] = v;
    } else {
      let canChange: boolean = true;
      let pointer: number = maxPos;
      while (posList[pointer] && pointer >= 0) {
        if (posList[pointer].getOptions(priorityKey) >= v.getOptions(priorityKey)) {
          canChange = false;
          break;
        }
        pointer--;
      }
      if (pointer < 0) {
        canChange = false;
      }
      if (canChange) {
        for (let i: number = maxPos; i > pointer; i--) {
          posList[i].setOptions('x', i - 1);
          posList[i - 1] = posList[i];
        }
        v.setOptions('x', maxPos);
        posList[maxPos] = v;
      } else {
        maxPos += 1;
        v.setOptions('x', maxPos);
        posList[maxPos] = v;
      }
    }

  })
}

function compact(levels: Array<Array<Vertex>>) {
    const maxPos: number = Math.max.apply(null, levels.map(lvl => Math.max.apply(null, lvl.map(v => v.getOptions('x')))));
    for(let ci: number = 1; ci <= maxPos; ci++) {
        for(let ri: number = 0; ri < levels.length; ri++) {
        }
    }
}
