import { expect } from 'chai';
import { dagShortestPath } from '../path/shortest';
import { Vertex } from '../path/graph';

describe('DAG shortest path', () => {
  const v1: Vertex = new Vertex(1);
  const v2: Vertex = new Vertex(2);
  const v3: Vertex = new Vertex(3);
  const v4: Vertex = new Vertex(4);
  const v5: Vertex = new Vertex(5);
  const v6: Vertex = new Vertex(6);
  const v7: Vertex = new Vertex(7);
  const v8: Vertex = new Vertex(8);

  it('#with path', () => {
    const shortest: ShortestPath = breadFirstShortestGridSearch(grid1, { x: 0, y: 1}, { x: 3, y: 3});
    expect(shortest.points.length).equal(5);
  });
  
});

