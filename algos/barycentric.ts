import { Vertex } from "../misc/graph";
import { edgeMatrix } from '../misc/misc';
import { crossCount } from '../misc/penaltyGraph';

/*
* heuristic method for the reordering of the row order \sigma_1 = v_1 v_2 \cdots v_{|V_1|} to
* reduce the number of crossings under the fixed column order \sigma_2 in M(\sigma_1, \sigma_2)
*/

interface OrderWrapper {
  value: number;
  idx: number
}

export function bc(ups: Array<Vertex>, downs: Array<Vertex>) {
  phase1(ups, downs);
}

function barycenter(W: Array<Vertex>, nLevel: Array<Vertex>) {
  const matrix: Array<Array<number>> = edgeMatrix(W, nLevel);
  let rows: Array<number> = [];
  let cols: Array<number> = [];
  W.map((v, idx) => {
    rows[idx] = matrix[idx].map((v, i) => v * (i + 1)).reduce((prev, cur) => prev + cur, 0) / matrix[idx].reduce((prev, cur) => prev + cur, 0);
  });
  nLevel.map((c, idx) => {
    let weights: number = 0;
    let sum: number = 0;
    W.map((v, i) => {
      weights += matrix[i][idx] * (i + 1);
      sum += matrix[i][idx];
    })
    cols[idx] = weights / sum;
  })
  return { rows, cols };
}

function phase1(row: Array<Vertex>, col: Array<Vertex>, iterCnt: number = 0, totalCnt: number = 12) {
  const { rows } = barycenter(row, col);
  let M0: Array<Array<number>> = edgeMatrix(row, col);
  let MS: Array<Array<number>> = M0;
  let KS: number = crossCount(row, col);
  console.log(KS);
  const nrows: Array<OrderWrapper> = rows.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedRows: Array<OrderWrapper> = nrows.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  })
  const newRow: Array<Vertex> = sortedRows.map(order => {
    return row[order.idx];
  })
  let M1 = edgeMatrix(newRow, col);
  MS = M1;
  KS = crossCount(newRow, col);
  console.log(KS);
  const { cols } = barycenter(newRow, col);
  const ncols: Array<OrderWrapper> = cols.map((r, i) => {
    return { value: r, idx: i };
  });
  const sortedCols: Array<OrderWrapper> = ncols.sort((a, b) => {
    return a.value <= b.value ? -1 : 1;
  })
  const newCol: Array<Vertex> = sortedCols.map(order => {
    return col[order.idx];
  })
  const M2: Array<Array<number>> = edgeMatrix(newRow, newCol);
  const KSS: number = crossCount(newRow, newCol);
  if (KSS < KS) {
    KS = KSS;
    MS = M2;
    console.log(KS);
  }
  if (matrixEqual(M0, M2) || iterCnt >= totalCnt) {
    return phase2(newRow, newCol);
  } else {
    return phase1(newRow, newCol, iterCnt + 1, totalCnt);
  }
}

function phase2(row: Array<Vertex>, col: Array<Vertex>) {

}

function matrixEqual(m1: Array<Array<number>>, m2: Array<Array<number>>): boolean {
  if (m1.length != m2.length) return false;
  if (m1[0].length != m2[0].length) return false;
  let equal: boolean = true;
  m1.map((row, i) => {
    row.map((col, j) => {
      if (col != m2[i][j]) equal = false;
    })
  })
  return equal;
}