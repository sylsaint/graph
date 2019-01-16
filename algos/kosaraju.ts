import Graph, { Vertex, Edge } from '../misc/graph';
import { transpose } from '../misc/graphUtil';
import { dfs } from './traversal';

/*
* algorithm is DFS based. It does DFS two times. DFS of a graph produces a single tree 
* if all vertices are reachable from the DFS starting point. Otherwise DFS produces a forest. 
* So DFS of a graph with only one SCC always produces a tree. The important point to note is 
* DFS may produce a tree or a forest when there are more than one SCCs depending upon the 
* chosen starting point. 
*/
export function kosaraju(g: Graph) {
  let visited: Array<Vertex> = [];
  let hasVisited = (vertex: Vertex): boolean => visited.indexOf(vertex) > -1;
  const traversed: any = dfs(g);
  transpose(g);
  let sccs: Array<any> = [];
  traversed.map(stack => {
    stack.map(v => {
      if (hasVisited(v)) return;
      let connected: any = dfs(g, v);
      let scc: any = connected.map(v => {
        if (!hasVisited(v)) {
          visited.push(v);
          return v;
        }
      }).filter(v => !!v);
      sccs.push(scc);
      console.log(scc);
    })
  })
  return sccs;
}