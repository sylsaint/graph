import { Vertex } from "./graph";

export interface LayoutOptions {
  padding: Padding;
  gutter: number;
  width: number;
  height: number;
}

export interface Padding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface HashMap {
  [key: string]: any;
}

export interface VerticeMap {
  [key: number]: Array<Vertex>;
  [key: string]: Array<Vertex>;
}