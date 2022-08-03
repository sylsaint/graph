import { orderVertices, VertexInfo } from '../algos/vertexorder';

describe('vertices linear order by divide and conquer', () => {
  it('should order correctly', () => {
    const vs: VertexInfo[] = [{ outDegree: 10 }, { outDegree: 1}, { outDegree: 3}, { outDegree: 6}, { outDegree: 4}];
    const ordered = orderVertices(vs, 1, vs.length);
    console.log(ordered);
  });
});

