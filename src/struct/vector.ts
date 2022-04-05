import { BoundingBox } from "../types/BoundingBox";
import { Point } from "../types/Point";
import { Shape } from "../types/Shape";
import {
  CubicVector,
  ReflectionVector,
  SingularVector,
  Vector,
  VectorId,
  VectorPositionMap,
  VectorType,
} from "../types/Vector";
import { uuidv4 } from "../utils/common";
import { isPointInBoundingBox } from "./BoundingBox";
import { getVectorById } from "./Canvas";
import { applyDPI, distance, PointInvisible } from "./Point";

export const StaticVectorId = uuidv4();

export const singularVector = (
  position: Point = PointInvisible,
  vectorId: VectorId = StaticVectorId,
  isLoopSegment: boolean = false
): SingularVector => {
  return {
    type: VectorType.Singular,
    position,
    id: vectorId,
    loopSegment: isLoopSegment,
  };
};

export const reflectionVector = (
  position: Point = PointInvisible,
  vectorId: VectorId = StaticVectorId
): ReflectionVector => {
  return { type: VectorType.Reflection, position, id: vectorId };
};

export const cubicVector = (
  position: Point = PointInvisible,
  vectorId: VectorId = StaticVectorId,
  isLoopSegment: boolean = false
): CubicVector => {
  return {
    type: VectorType.Cubic,
    position,
    id: vectorId,
    left: StaticVectorId,
    right: StaticVectorId,
    loopSegment: isLoopSegment,
  };
};

export const vectorsToPath2d = (
  vectors: Vector[],
  allVectors: Vector[] = []
): Path2D => {
  const path = new Path2D();
  if (!vectors.length) {
    return path;
  }

  const [x, y] = applyDPI(vectors[0].position);
  path.moveTo(x, y);
  let previousVector = vectors[0];
  for (const vector of vectors) {
    const [x, y] = applyDPI(vector.position);
    switch (vector.type) {
      case VectorType.Cubic:
        let cp1x;
        let cp1y;
        let cp2x;
        let cp2y;
        if (previousVector.type === VectorType.Cubic) {
          const previousPosition = applyDPI(
            getVectorById(allVectors, previousVector.right).position
          );
          const controlPoint = applyDPI(
            getVectorById(allVectors, vector.left).position
          );
          cp1x = previousPosition[0];
          cp1y = previousPosition[1];
          cp2x = controlPoint[0];
          cp2y = controlPoint[1];
        } else if (previousVector.type === VectorType.Quadratic) {
          const previousPosition = applyDPI(
            getVectorById(allVectors, previousVector.other).position
          );
          const controlPoint = applyDPI(
            getVectorById(allVectors, vector.left).position
          );
          cp1x = previousPosition[0];
          cp1y = previousPosition[1];
          cp2x = controlPoint[0];
          cp2y = controlPoint[1];
        } else {
          const previousPosition = applyDPI(previousVector.position);
          const controlPoint = applyDPI(
            getVectorById(allVectors, vector.left).position
          );
          cp1x = previousPosition[0];
          cp1y = previousPosition[1];
          cp2x = controlPoint[0];
          cp2y = controlPoint[1];
        }
        path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        break;
      case VectorType.Quadratic:
        const controlPoint = applyDPI(getVectorById(allVectors, vector.other).position);
        path.quadraticCurveTo(
          controlPoint[0],
          controlPoint[1],
          x,
          y
        );
        break;
      case VectorType.Singular:
        path.lineTo(x, y);
        break;
    }
    previousVector = vector;
  }
  return path;
};

export const findVectorCloserTo = (
  vectors: Vector[],
  position: Point,
  radius = 10
) => {
  return vectors.find((vector) => distance(position, vector.position) < radius);
};

export const buildVectorPositionMap = (
  vectors: Vector[],
  vectorIds: VectorId[]
): VectorPositionMap => {
  let matrix: VectorPositionMap = {};
  for (const vectorId of vectorIds) {
    const vector = getVectorById(vectors, vectorId);
    switch (vector.type) {
      case VectorType.Cubic:
        matrix = {
          ...matrix,
          [vector.id]: vector.position,
          [vector.left]: getVectorById(vectors, vector.left).position,
          [vector.right]: getVectorById(vectors, vector.right).position,
        };
        break;
      case VectorType.Quadratic:
        matrix = {
          ...matrix,
          [vector.id]: vector.position,
          [vector.other]: getVectorById(vectors, vector.other).position,
        };
        break;
      default:
        matrix = { ...matrix, [vector.id]: vector.position };
    }
  }
  return matrix;
};

export const isLoopableVectorType = (vectorType: VectorType): boolean =>
  [VectorType.Singular, VectorType.Quadratic, VectorType.Cubic].includes(
    vectorType
  );

export const getShapeOfVector = (shapes: Shape[], vectorId: VectorId) => {
  return shapes.find((shape) => shape[1].includes(vectorId));
};

export const vectorsInBoundingBox = (
  vectors: Vector[],
  boundingBox: BoundingBox
): Vector[] => {
  return vectors.filter((vector) =>
    isPointInBoundingBox(vector.position, boundingBox)
  );
};
