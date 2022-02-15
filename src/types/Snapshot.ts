import { Shape, ShapeId } from "./Shape";
import { CanvasMode } from "./CanvasMode";
import { Vector, VectorId } from "./Vector";

export type Snapshot = [
  mode: CanvasMode,
  allShapes: Shape[],
  allVectors: Vector[],
  currentShapeId: ShapeId,
  currentVectorId: VectorId
];
