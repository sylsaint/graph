import Graph, { Vertex, Edge } from '../misc/graph';
import { cloneGraph, findVertexById, getDummyId, printVertexNeighbours } from '../misc/graphUtil';

export function makeHierarchy(g: Graph): Array<Array<Vertex>> {
  let roots: Array<Vertex> = [];
  // find all the roots without incoming edges
  let cloned: Graph = cloneGraph(g);
  cloned.vertices.map(v => {
    let isRoot: boolean = true;
    let outDegree: number = 0;
    let inDegree: number = 0;
    v.edges.map(edge => {
      if (edge.down == v) {
        isRoot = false;
        inDegree += 1;
      } else {
        outDegree += 1;
      }
    });
    if (isRoot) {
      roots.push(v);
    } else {
      v.setOptions('outInRatio', outDegree / inDegree);
    }
  });
  // judge if roots is empty, if yes, add max (out(v) / in (v)) to roots
  if (!roots.length) {
    // find the maximum ratio
    let max: number = 0;
    cloned.vertices.map(v => {
      let ratio: number = v.getOptions('outInRatio');
      if (ratio > max) max = ratio;
    });
    cloned.vertices.map(v => {
      if (v.getOptions('outInRatio') == max) roots.push(v);
    });
  }
  let visited = [];
  while (roots.length) {
    const node: Vertex = roots.shift() as Vertex;
    if (!node.getOptions('level')) {
      node.setOptions('level', 1);
    }
    if (visited.indexOf(node) > -1) {
      continue;
    }
    visited.push(node);
    let exclude: Array<Edge> = [];
    node.edges.map(edge => {
      const down: Vertex = edge.down;
      exclude.push(edge);
      let only: boolean = true;
      // check if there are other incomming edges
      down.edges.map(edge => {
        if (edge.up != node && edge.down == down) only = false;
      });
      if (only) {
        let downLevel: number = down.getOptions('level');
        if (!downLevel) {
          down.setOptions('level', node.getOptions('level') + 1);
        } else {
          // ensure even there are cycles, procedure can be terminated
          if (downLevel < node.getOptions('level') + 1 && downLevel != 1) {
            down.setOptions('level', node.getOptions('level') + 1);
          }
        }
        roots.push(down);
      }
    });
    exclude.map(edge => cloned.removeEdge(edge));
  }
  let levels: Array<Array<Vertex>> = adjustLevel(g, visited);
  addDummy(g, levels);
  return levels;
}

function adjustLevel(g: Graph, vertices: Array<Vertex>): Array<Array<Vertex>> {
  // retrieving real vertices from visited
  let levels: Array<Array<Vertex>> = [];
  let gVertices: Array<Vertex> = [];
  vertices.map(v => {
    let found: Vertex = findVertexById(g, v.id);
    if (found instanceof Vertex) {
      found.setOptions('level', v.getOptions('level'));
      found.setOptions('x', v.getOptions('x'));
      found.setOptions('y', v.getOptions('y'));
      gVertices.push(found);
    }
  });
  if (gVertices.length != vertices.length) {
    throw new Error('vertices are not equal to expected !');
  }
  gVertices.map(v => {
    const lvl: number = v.getOptions('level');
    if (levels[lvl - 1]) {
      levels[lvl - 1].push(v);
    } else {
      levels[lvl - 1] = [v];
    }
  });
  for (let i: number = levels.length - 1; i >= 0; i--) {
    let exclude: Array<Vertex> = [];
    levels[i].map(v => {
      let min: number = Number.POSITIVE_INFINITY;
      v.edges.map(edge => {
        if (edge.up == v && edge.down.getOptions('level') < min) min = edge.down.getOptions('level');
      });
      if (min != Number.POSITIVE_INFINITY && min != 1 && v.getOptions('level') != min - 1) {
        v.setOptions('level', min - 1);
        levels[min - 2].push(v);
        exclude.push(v);
      }
    });
    exclude.map(v => {
      const pos: number = levels[i].indexOf(v);
      if (pos > -1) levels[i].splice(pos, 1);
    });
  }
  return levels;
}

function addDummy(g: Graph, levels: Array<Array<Vertex>>): Array<Array<Vertex>> {
  levels.map(level => {
    level.map((v, idx) => {
      const currentLevel: number = v.getOptions('level');
      v.edges.map(edge => {
        if (edge.up == v) {
          let down: Vertex = edge.down;
          const nextLevel: number = down.getOptions('level');
          let up: Vertex = v;
          if (nextLevel - currentLevel > 1) {
            for (let lvl: number = currentLevel + 1; lvl < nextLevel; lvl++) {
              let dummpyVertex: Vertex = new Vertex(getDummyId(), { level: lvl, type: 'dummy' });
              g.addVertex(dummpyVertex);
              g.addEdge(new Edge(up, dummpyVertex));
              up = dummpyVertex;
              if (idx >= levels[lvl - 1].length) {
                levels[lvl - 1].push(dummpyVertex);
              } else {
                levels[lvl - 1].splice(idx, 0, dummpyVertex);
              }
            }
            g.addEdge(new Edge(up, down));
            g.removeEdge(edge);
          }
        }
      });
    });
  });
  return levels;
}
