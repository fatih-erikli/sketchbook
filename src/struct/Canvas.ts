import { Canvas } from "../types/Canvas";
import { CanvasMode } from "../types/CanvasMode";
import { ShapeId } from "../types/Shape";
import { Vector, VectorId } from "../types/Vector";
import { uuidv4 } from "../utils/common";
import { merge } from "../utils/object";
import { boundingBox } from "./BoundingBox";
import { PointInvisible } from "./Point";
import { style } from "./Style";
import { EmptyDocumentNewVectorId } from "./vector";
export const EmptyDocumentNewShapeId: ShapeId = uuidv4();
export const defaultCanvas: Canvas = {
  selection: [boundingBox(), [[], []]],
  snapshot: [CanvasMode.Draw, [], [], EmptyDocumentNewShapeId, EmptyDocumentNewVectorId],
  past: [],
  future: [],
  style: style(),
  cursor: PointInvisible,
  translatedVectorPositions: {},
};

export const canvas = (canvas: Canvas, updates: Partial<Canvas>) =>
  merge(canvas, updates);

export const getVectorById = (vectors: Vector[], id: VectorId) => {
  return vectors.find((vector) => vector.id === id)!;
};

export const updateVectorsById = (
  vectors: Vector[],
  patches: Record<VectorId, Partial<Vector>>
): Vector[] => {
  return vectors.map((vector) =>
    vector.id in patches
      ? ({ ...vector, ...patches[vector.id] } as Vector)
      : vector
  );
};
