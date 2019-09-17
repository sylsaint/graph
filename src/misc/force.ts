import { Coordinate } from "./interface";

export interface Direction {
  x: number;
  y: number;
}

export interface Force {
  value: number;
  direct: Direction;
}


// 库伦定律的表达式为 F = q * q' / (4 * Math.PI * e0 * r^2), e0表示真空中的电容率
// 标量形式：F = ke * q * q' / r^2
// 矢量形式: F = ke * q * q' * (r - r') / |r - r'|^3
// 此处计算矢量形式，并且将模型简化为 F = repulsion / r^2
export function coulombForce(repulsion: number, r: number, p1: Coordinate, p2: Coordinate): Force {
  return {
    value: repulsion * repulsion / (r * r),
    direct: { x: p1.x - p2.x, y: p1.y - p2.y },
  };
}

// 胡克定律：F = k * x
export function hookeForce(stiffness: number, delta: number, p1: Coordinate, p2: Coordinate): Force {
  return {
    value: stiffness * delta,
    direct: { x: p2.x - p1.x, y: p2.y - p1.y },
  }
}