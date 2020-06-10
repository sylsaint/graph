import { expect } from 'chai';
import { ShortestPath, Grid } from '../path/index';
import { breadFirstShortestGridSearch } from '../path/grid';

describe('Grid shortest path', () => {
  const grid: Grid = [
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0]
  ];
  it('#bread first', () => {
    const shortest: ShortestPath = breadFirstShortestGridSearch(grid, { x: 0, y: 1}, { x: 3, y: 3});
    console.log(shortest);
  });
});

