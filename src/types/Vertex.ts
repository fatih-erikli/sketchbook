import { Point } from "./Point";

export enum VertexType {
  ControlPoint,
  Position,
};

export type Vertex = {
  point: Point,
  alignedWith: Point[],
  mirroredWith: Point[],
  type: VertexType,
};
