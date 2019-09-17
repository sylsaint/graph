import { Node, Edge, RectArea, QuadTree } from '../misc/quadtree';

export function dividePlane(qt: QuadTree, levels: number = 5, area?: RectArea): QuadTree | undefined {
  if (levels < 0) return;
  const nodes: Node[] = qt.nodes;
  if (area) {
    qt.area = area;
  } else {
    qt.area = makeRectangle(nodes);
  }
  qt.setNodes(nodes);
  // 水平和垂直的中心点
  const hmid: number = (qt.area.x1 + qt.area.x) / 2;
  const vmid: number = (qt.area.y1 + qt.area.y) / 2;
  const nodes0: Node[] = [];
  const nodes1: Node[] = [];
  const nodes2: Node[] = [];
  const nodes3: Node[] = [];
  nodes.map((node: Node) => {
    // 在左上角
    if (node.x <= hmid && node.y <= vmid) nodes0.push(node);
    // 在右上角
    if (node.x > hmid && node.y <= vmid) nodes1.push(node);
    // 在左下角
    if (node.x <= hmid && node.y > vmid) nodes2.push(node);
    // 在右下角
    if (node.x > hmid && node.y > vmid) nodes3.push(node);
  })
  // 递归处理
  const qt0: QuadTree = new QuadTree(nodes0);
  qt.addChild(qt0);
  dividePlane(qt0, levels - 1);
  const qt1: QuadTree = new QuadTree(nodes1);
  qt.addChild(qt1);
  dividePlane(qt1, levels - 1);
  const qt2: QuadTree = new QuadTree(nodes2);
  qt.addChild(qt2);
  dividePlane(qt2, levels - 1);
  const qt3: QuadTree = new QuadTree(nodes3);
  qt.addChild(qt3);
  dividePlane(qt3, levels - 1);
  return qt;
}

function makeRectangle(nodes: Node[]): RectArea {
  const rect: RectArea = {
    x: Number.POSITIVE_INFINITY,
    y: Number.POSITIVE_INFINITY,
    x1: Number.NEGATIVE_INFINITY,
    y1: Number.NEGATIVE_INFINITY,
  };
  nodes.map((node: Node) => {
    rect.x = Math.min(node.x, rect.x);
    rect.y = Math.min(node.y, rect.y);
    rect.x1 = Math.max(node.x, rect.x1);
    rect.y1 = Math.max(node.y, rect.y1);
  })
  return rect;
}