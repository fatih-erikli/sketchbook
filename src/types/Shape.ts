import { Style } from "./Style";
import { VectorId } from "./Vector";

export type ShapeId = string;
export type Shape = [
  id: ShapeId,
  vectorIds: VectorId[],
  style: Style,
];
