import { Shape, ShapeId } from "../types/Shape";
import { Vector } from "../types/Vector";
import { Black, WhiteTransparent } from "../utils/color";
import { getVectorById, EmptyDocumentNewShapeId } from "./Canvas";

export const getShapeById = (shapes: Shape[], id: ShapeId) => {
  return (
    shapes.find((shape) => shape[0] === id) || [
      EmptyDocumentNewShapeId,
      [],
      [WhiteTransparent, Black, 1],
    ]
  );
};

export const pointsFromShapeIds = (
  shapes: Shape[],
  vectors: Vector[],
  shapeIds: ShapeId[]
) => {
  return shapeIds
    .map((shapeId) => getShapeById(shapes, shapeId))
    .map((shape) =>
      shape[1].map((vectorId) => getVectorById(vectors, vectorId).position)
    )
    .reduce((prev, current) => prev.concat(current), []);
};
