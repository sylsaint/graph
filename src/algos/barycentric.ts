import Graph, { Vertex } from '../misc/graph';
import { edgeMatrix } from '../misc/misc';
import { crossCount } from '../misc/penaltyGraph';

/*
 * heuristic method for the reordering of the row order \sigma_1 = v_1 v_2 \cdots v_{|V_1|} to
 * reduce the number of crossings under the fixed column order \sigma_2 in M(\sigma_1, \sigma_2)
 */

interface OrderWrapper {
  value: number;
  idx: number;
}

interface RowCol {
  rows: Array<number>;
  cols: Array<number>;
}

interface BcRet {
  row: Array<Vertex>;
  col: Array<Vertex>;
}

export function bc(ups: Array<Vertex>, downs: Array<Vertex>) {
  phase1(ups, downs);
}

function barycenter(W: Array<Vertex>, nLevel: Array<Vertex>) {
  const matrix: Array<Array<number>> = edgeMatrix(W, nLevel);
  let rows: Array<number> = [];
  let cols: Array<number> = [];
  W.map((v, idx) => {
    rows[idx] =
      matrix[idx].map((v, i) => v * (i + 1)).reduce((prev, cur) => prev + cur, 0) /
      (matrix[idx].reduce((prev, cur) => prev + cur, 0) || 1);
  });
  nLevel.map((c, idx) => {
    let weights: number = 0;
    let sum: number = 0;
    W.map((v, i) => {
      weights += matrix[i][idx] * (i + 1);
      sum += matrix[i][idx];
    });
    cols[idx] = weights / (sum || 1);
  });
  return { rows, cols };
}

function phase1(row: Array<Vertex>, col: Array<Vertex>, iterCnt: number = 0, totalCnt: number = 12): BcRet {
  const { rows } = barycenter(row, col);
  let M0: Array<Array<number>> = edgeMatrix(row, col);
  let MS: Array<Array<number>> = M0;
  let KS: number = crossCount(row, col);
  const nrows: Array<OrderWrapper> = rows.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newRow: Array<Vertex> = sortedRows.map(order => {
    return row[order.idx];
  });
  let M1 = edgeMatrix(newRow, col);
  MS = M1;
  KS = crossCount(newRow, col);
  const { cols } = barycenter(newRow, col);
  const ncols: Array<OrderWrapper> = cols.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newCol: Array<Vertex> = sortedCols.map(order => {
    return col[order.idx];
  });
  const M2: Array<Array<number>> = edgeMatrix(newRow, newCol);
  const KSS: number = crossCount(newRow, newCol);
  if (KSS < KS) {
    KS = KSS;
    MS = M2;
  }
  if (matrixEqual(M0, M2) || iterCnt >= totalCnt) {
    return phase2(newRow, newCol, iterCnt + 1, totalCnt);
  } else {
    return phase1(newRow, newCol, iterCnt + 1, totalCnt);
  }
}

function phase2(row: Array<Vertex>, col: Array<Vertex>, iterCnt: number, totalCnt: number): BcRet {
  const { rows } = barycenter(row, col);
  const nrows: Array<OrderWrapper> = rows.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
    return a.value == b.value ? 1 : a.value < b.value ? -1 : 1;
  });
  const newRow: Array<Vertex> = sortedRows.map(order => {
    return row[order.idx];
  });

  const { cols } = barycenter(newRow, col);
  let increasing: boolean = true;
  cols.sort((a, b) => {
    if (a > b) increasing = false;
    return -1;
  });
  if (increasing) {
    const ncols: Array<OrderWrapper> = cols.map((r, i) => {
      return { value: r, idx: i };
    });
    const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
      return a.value <= b.value ? -1 : 1;
    });
    const newCol: Array<Vertex> = sortedCols.map(order => {
      return col[order.idx];
    });
    const rw: RowCol = barycenter(newRow, newCol);
    increasing = true;
    rw.cols.sort((a, b) => {
      if (a > b) increasing = false;
      return -1;
    });
    if (increasing) {
      // terminate
      return { row: newRow, col: newCol };
    } else {
      if (iterCnt >= totalCnt) {
        // terminate
        return { row, col };
      } else {
        return phase1(newRow, newCol, iterCnt + 1, totalCnt);
      }
    }
  } else {
    if (iterCnt >= totalCnt) {
      // terminate
      return { row, col };
    } else {
      return phase1(newRow, col, iterCnt + 1, totalCnt);
    }
  }
}

function matrixEqual(m1: Array<Array<number>>, m2: Array<Array<number>>): boolean {
  if (m1.length != m2.length) return false;
  if (m1[0].length != m2[0].length) return false;
  let equal: boolean = true;
  m1.map((row, i) => {
    row.map((col, j) => {
      if (col != m2[i][j]) equal = false;
    });
  });
  return equal;
}

export function nbarycenter(g: Graph, levels: Array<Array<Vertex>>, interCount: number = 5): Array<Array<Vertex>> {
  // phase 1
  if (levels.length <= 1) {
    return levels;
  }
  for (let i: number = 0; i < interCount; i++) {
    for (let li: number = 0; li < levels.length - 1; li++) {
      const nextLevel: Array<Vertex> = rowPhase(levels[li], levels[li + 1]);
      levels[li + 1] = nextLevel;
    }
    for (let li: number = levels.length - 1; li > 0; li--) {
      const prevLevel: Array<Vertex> = columnPhase(levels[li - 1], levels[li]);
      levels[li - 1] = prevLevel;
    }
  }
  // judge if phase 2 is needed
  downUpPhase(levels);
  return levels;
}

function rowPhase(row: Array<Vertex>, col: Array<Vertex>): Array<Vertex> {
  const { cols } = barycenter(row, col);
  const ncols: Array<OrderWrapper> = cols.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newCol: Array<Vertex> = sortedCols.map(order => {
    return col[order.idx];
  });
  return newCol;
}

function columnPhase(row: Array<Vertex>, col: Array<Vertex>): Array<Vertex> {
  const { rows } = barycenter(row, col);
  const nrows: Array<OrderWrapper> = rows.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newRow: Array<Vertex> = sortedRows.map(order => {
    return row[order.idx];
  })
  return newRow;
}

function downUpPhase(levels: Array<Array<Vertex>>) {
  // down procedure
  for (let li: number = 0; li < levels.length - 1; li++) {
    const { cols } = barycenter(levels[li], levels[li + 1]);
    if (hasDuplicate(cols)) {
      const ncols: Array<OrderWrapper> = cols.map((r, i) => {
        return { value: r, idx: i };
      });
      const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
        return a.value == b.value ? 1 : a.value < b.value ? -1 : 1;
      });
      const nc: Array<Vertex> = sortedCols.map(order => {
        return levels[li + 1][order.idx];
      });
      levels[li + 1] = nc;
      for (let ni: number = li + 1; ni < levels.length - 1; ni++) {
        levels[ni + 1] = rowPhase(levels[ni], levels[ni + 1]);
      }
    }
  }
  // up procedure
  for (let li: number = levels.length - 1; li > 0; li--) {
    const { rows } = barycenter(levels[li - 1], levels[li]);
    if (hasDuplicate(rows)) {
      const nrows: Array<OrderWrapper> = rows.map((r, i) => {
        return { value: r, idx: i };
      });
      const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
        return a.value == b.value ? 1 : a.value < b.value ? -1 : 1;
      });
      const nr: Array<Vertex> = sortedRows.map(order => {
        return levels[li - 1][order.idx];
      });
      levels[li - 1] = nr;
      for (let ui: number = li - 1; ui > 0; ui--) {
        levels[ui - 1] = columnPhase(levels[ui - 1], levels[ui]);
      }
    }
  }
}

function hasDuplicate(arr: Array<number>): boolean {
  let hasDup: boolean = false;
  const nmap: { [key: number]: number } = {};
  arr.map(i => {
    if (!nmap[i]) {
      nmap[i] = 1;
    } else {
      hasDup = true;
    }
  });
  return hasDup;
}