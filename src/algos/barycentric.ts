import Graph, { Vertex } from '../misc/graph';
import { edgeMatrix } from '../misc/misc';
import { crossCount } from '../misc/penaltyGraph';

/*
 * heuristic method for the reordering of the row order \sigma_1 = v_1 v_2 \cdots v_{|V_1|} to
 * reduce the number of crossings under the fixed column order \sigma_2 in M(\sigma_1, \sigma_2)
 */

export interface OrderWrapper {
  value: number;
  idx: number;
}

export interface RowCol {
  rows: Array<number>;
  cols: Array<number>;
}

export interface BaryCentricResult {
  row: Array<Vertex>;
  col: Array<Vertex>;
  crossCount: number;
}

export type BaryCentricOptions = {
  // current iteration round
  currentRound?: number;
  // total iteration round
  totalRound?: number;
  // if row is fixed, only col will be permutated
  rowFixed?: boolean;
  // if col is fixed, only row will be permutated
  colFixed?: boolean;
  // you should not set this, for inner use
  exchanged?: { [key: string]: boolean };
  // you should not set this, for inner use
  minCross?: number;
  // you should not set this, for inner use
  crossCount?: number;
};

const DEFAULT_TOTAL_ROUND = 12;

function getKey(key1: string | number, key2: string | number, reversed: boolean = false) {
  if (reversed) return `${key2}_|_${key1}`;
  return `${key1}_|_${key2}`;
}

/**
 *
 * @param prevLevel -- vertices at some level
 * @param nextLevel -- vertices at next level
 * @returns barycentric coefficient of everty vertex in prevLeven and nextLevel
 */
function calcBaryCentricCoefficient(prevLevel: Array<Vertex>, nextLevel: Array<Vertex>) {
  const matrix: Array<Array<number>> = edgeMatrix(prevLevel, nextLevel);
  let rows: Array<number> = [];
  let cols: Array<number> = [];
  prevLevel.map((_v, idx) => {
    rows[idx] =
      matrix[idx].map((v, i) => v * (i + 1)).reduce((prev, cur) => prev + cur, 0) /
      (matrix[idx].reduce((prev, cur) => prev + cur, 0) || 1);
  });
  nextLevel.map((_c, idx) => {
    let weights: number = 0;
    let sum: number = 0;
    prevLevel.map((_v, i) => {
      weights += matrix[i][idx] * (i + 1);
      sum += matrix[i][idx];
    });
    cols[idx] = weights / (sum || 1);
  });
  return { rows, cols };
}

/**
 *
 * @description this is a heuristic method which tries to reduce crossings. with calculating barycentric coefficient of every vertex 
 * and reordering vertext position, this method can reduce crossings effectively.
 * @param row -- vertices at some level, treated as row
 * @param col -- vertices at next level, treated as col
 * @param options -- configuration object to function
 * @returns
 */
export function calcTwoLevelBaryCentric(
  row: Vertex[],
  col: Vertex[],
  {
    currentRound = 1,
    totalRound = DEFAULT_TOTAL_ROUND,
    minCross = Number.POSITIVE_INFINITY,
    exchanged = {},
    rowFixed,
    colFixed,
  }: BaryCentricOptions,
): BaryCentricResult {
  const { rows } = calcBaryCentricCoefficient(row, col);
  let KS: number = crossCount(row, col);
  let KSS = KS;
  let rowReOrdered = false;
  let colReOrdered = false;

  let newRow = row;
  if (!rowFixed) {
    newRow = rows
      .map((r, i) => {
        return { value: r, idx: i };
      })
      .sort((a, b) => {
        return a.value <= b.value ? -1 : 1;
      })
      .map((order) => {
        return row[order.idx];
      });
    KSS = crossCount(newRow, col);
    if (KSS < KS) {
      rowReOrdered = true;
      KS = KSS;
    }
  }

  let newCol = col;
  if (!colFixed) {
    const { cols } = calcBaryCentricCoefficient(newRow, col);
    newCol = cols
      .map((r, i) => {
        return { value: r, idx: i };
      })
      .sort((a, b) => {
        return a.value <= b.value ? -1 : 1;
      })
      .map((order) => {
        return col[order.idx];
      });
    KSS = crossCount(newRow, newCol);
    if (KSS < KS) {
      colReOrdered = true;
      KS = KSS;
    }
  }
  if (KS >= minCross) {
    return finetuneTwoLevelBaryCentric(row, col, {
      currentRound,
      totalRound,
      exchanged,
      crossCount: minCross,
      rowFixed,
      colFixed,
    });
  } else {
    return calcTwoLevelBaryCentric(rowReOrdered ? newRow : row, colReOrdered ? newCol : col, {
      currentRound,
      totalRound,
      minCross: KS,
      exchanged,
      rowFixed,
      colFixed,
    });
  }
}

/**
 *
 * @description if there are vertices in row/col which have the same barycentric coefficient, this function would try to exchange
 * their positions in order to reduce crossings.
 * @param prevLevel -- vertices at some level
 * @param nextLevel -- vertices at next level
 * @returns barycentric coefficient of everty vertex in prevLeven and nextLevel
 */
function finetuneTwoLevelBaryCentric(
  row: Vertex[],
  col: Vertex[],
  {
    currentRound = 1,
    totalRound = DEFAULT_TOTAL_ROUND,
    exchanged = {},
    crossCount = Number.POSITIVE_INFINITY,
    rowFixed,
    colFixed,
  }: BaryCentricOptions,
): BaryCentricResult {
  // reach iteration max limit or eliminate all crosses
  if (currentRound >= totalRound || crossCount === 0) return { row, col, crossCount };
  const { rows, cols } = calcBaryCentricCoefficient(row, col);
  const isRowMonotonicallyIncreasing =
    rows.filter((v, i) => {
      if (i === rows.length - 1) return false;
      return v === rows[i + 1];
    }).length === 0;
  const isColMonotonicallyIncreasing =
    cols.filter((v, i) => {
      if (i === cols.length - 1) return false;
      return v === cols[i + 1];
    }).length === 0;
  // if both row and col order is strictly ascending
  if (isRowMonotonicallyIncreasing && isColMonotonicallyIncreasing) {
    return { row, col, crossCount };
    // if col is strictly ascending
  } else if (isColMonotonicallyIncreasing) {
    if (rowFixed) return { row, col, crossCount };
    let allChanged = true;
    const reOrderedRow: Vertex[] = rows
      .map((r, i) => {
        return { value: r, idx: i };
      })
      .sort((a, b) => {
        if (a.value === b.value) {
          const hasExchanged = exchanged[getKey(row[a.idx].id, row[b.idx].id)];
          if (hasExchanged) return 0;
          exchanged[getKey(row[a.idx].id, row[b.idx].id)] = true;
          exchanged[getKey(row[a.idx].id, row[b.idx].id, true)] = true;
          allChanged = false;
          return 1;
        }
        return a.value < b.value ? -1 : 1;
      })
      .map((order) => row[order.idx]);
    if (allChanged) return { row, col, crossCount };
    return calcTwoLevelBaryCentric(reOrderedRow, col, {
      currentRound: currentRound + 1,
      totalRound,
      exchanged,
      minCross: crossCount,
      rowFixed,
      colFixed,
    });
  // if col is not strictly ascending
  } else {
    if (colFixed) return { row, col, crossCount };
    let allChanged = true;
    const reOrderedCols: Vertex[] = cols
      .map((r, i) => {
        return { value: r, idx: i };
      })
      .sort((a, b) => {
        if (a.value === b.value) {
          const hasExchanged = exchanged[getKey(col[a.idx].id, col[b.idx].id)];
          if (hasExchanged) return 0;
          exchanged[getKey(col[a.idx].id, col[b.idx].id)] = true;
          exchanged[getKey(col[a.idx].id, col[b.idx].id, true)] = true;
          allChanged = false;
          return 1;
        }
        return a.value <= b.value ? -1 : 1;
      })
      .map((order) => {
        return col[order.idx];
      });
    if (allChanged) return { row, col, crossCount };
    return calcTwoLevelBaryCentric(row, reOrderedCols, {
      currentRound: currentRound + 1,
      totalRound,
      minCross: crossCount,
      exchanged,
      rowFixed,
      colFixed,
    });
  }
}

export function ncalcBaryCentricCoefficient(
  g: Graph,
  levels: Array<Array<Vertex>>,
  interCount: number = 10,
): Array<Array<Vertex>> {
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
  const { cols } = calcBaryCentricCoefficient(row, col);
  const ncols: Array<OrderWrapper> = cols.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newCol: Array<Vertex> = sortedCols.map((order) => {
    return col[order.idx];
  });
  return newCol;
}

function columnPhase(row: Array<Vertex>, col: Array<Vertex>): Array<Vertex> {
  const { rows } = calcBaryCentricCoefficient(row, col);
  const nrows: Array<OrderWrapper> = rows.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  });
  const newRow: Array<Vertex> = sortedRows.map((order) => {
    return row[order.idx];
  });
  return newRow;
}

function downUpPhase(levels: Array<Array<Vertex>>) {
  // down procedure
  for (let li: number = 0; li < levels.length - 1; li++) {
    const { cols } = calcBaryCentricCoefficient(levels[li], levels[li + 1]);
    if (hasDuplicate(cols)) {
      const ncols: Array<OrderWrapper> = cols.map((r, i) => {
        return { value: r, idx: i };
      });
      const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
        return a.value == b.value ? 1 : a.value < b.value ? -1 : 1;
      });
      const nc: Array<Vertex> = sortedCols.map((order) => {
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
    const { rows } = calcBaryCentricCoefficient(levels[li - 1], levels[li]);
    if (hasDuplicate(rows)) {
      const nrows: Array<OrderWrapper> = rows.map((r, i) => {
        return { value: r, idx: i };
      });
      const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
        return a.value == b.value ? 1 : a.value < b.value ? -1 : 1;
      });
      const nr: Array<Vertex> = sortedRows.map((order) => {
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
  arr.map((i) => {
    if (!nmap[i]) {
      nmap[i] = 1;
    } else {
      hasDup = true;
    }
  });
  return hasDup;
}

export function bc(ups: Array<Vertex>, downs: Array<Vertex>) {
  calcTwoLevelBaryCentric(ups, downs, {});
}
