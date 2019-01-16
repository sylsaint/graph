/*
 * @author: yonglu.syl@gmail.com
 * @Description: sugiyama hierarchy algorightm
 * @params: {Graph} graph, {integer} width, {integer} height, {String} align
 * @return: {Graph} graph
 */

/*
 * Given a directed graph (digraph) G.V; E/ with a set of vertices Vand a set of edges E,the Sugiyama algorithm solves the problem of ﬁnding a 2D
 * hierarchical drawing of G subject to thefollowing readability requirements:
 * (a) Vertices are drawn on horizontal lines without overlapping; each line represents a level in thehierarchy; all edges point downwards.
 * (b) Short-span edges (i.e., edges between adjacent levels) are drawn with straight lines.
 * (c) Long-span edges (i.e., edges between nonadjacent levels) are drawn as close to straight linesas possible.
 * (d) The number of edge crossings is the minimum.(e) Vertices connected to each other are placed as close to each other as possible.
 * (f) The layout of edges coming into (or going out of) a vertex is balanced, i.e., edges are evenlyspaced around a common target (or source) vertex.
 */

import Graph from "../misc/graph";
import { kosaraju } from "./kosaraju";
import { penaltyGraph } from "../misc/penaltyGraph";

class Sugiyama {
  constructor() {}
  private shallow(graph: Graph): Graph {
    const ng = new Graph();
  }
  private transform(graph: Graph): Graph {}
  private eliminateCross(graph: Graph): Graph {}
  private positionX(graph: Graph): Graph {}
  private removeDummy(graph: Graph): Graph {}
  public layout(graph: Graph): Graph {}
}
