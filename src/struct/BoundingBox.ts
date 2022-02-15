import { BoundingBox } from "../types/BoundingBox";
import { Direction } from "../types/Direction";
import { Point } from "../types/Point";
import { max, mid, min, PointInvisible } from "./Point";
import { singularVector } from "./vector";

export const boundingBox = (
  a: Point = PointInvisible,
  b: Point = PointInvisible,
  c: Point = PointInvisible,
  d: Point = PointInvisible
): BoundingBox => [a, b, c, d];

export const boundingBoxToVectors = ([a, b, c, d]: BoundingBox) => {
  return [
    singularVector(a),
    singularVector(b),
    singularVector(c),
    singularVector(d),
    singularVector(a),
  ];
};

export const boundingBoxFromVectorPairs = (
  [x1, y1]: Point,
  [x2, y2]: Point
): BoundingBox => {
  const a = [max(x1, x2), min(y1, y2)];
  const b = [max(x1, x2), max(y1, y2)];
  const c = [min(x1, x2), max(y1, y2)];
  const d = [min(x1, x2), min(y1, y2)];
  return [a, b, c, d];
};

export const isPointInBoundingBox = (
  point: Point,
  boundingBox: BoundingBox
) => {
  return (
    point[0] > boundingBox[2][0] &&
    point[0] < boundingBox[0][0] &&
    point[1] > boundingBox[0][1] &&
    point[1] < boundingBox[1][1]
  );
};

export const boundingBoxFromPoints = (points: Point[]): BoundingBox => {
  const xs = points.map((position) => position[0]);
  const ys = points.map((position) => position[1]);
  const x1 = min.apply(null, xs);
  const x2 = max.apply(null, xs);
  const y1 = min.apply(null, ys);
  const y2 = max.apply(null, ys);
  return [
    [x2, y1],
    [x2, y2],
    [x1, y2],
    [x1, y1],
  ];
};

export const boundingBoxIntersects = (
  self: BoundingBox,
  other: BoundingBox
): boolean => {
  if (self.some((point) => isPointInBoundingBox(point, other))) {
    return true;
  }

  if (
    min(self[0][0], self[3][0]) < max(other[0][0], other[3][0]) &&
    max(self[0][0], self[3][0]) > min(other[3][0], other[0][0]) &&
    min(self[0][1], self[1][1]) < max(other[0][1], other[1][1]) &&
    max(self[0][1], self[1][1]) > min(other[0][1], other[1][1])
  ) {
    return true;
  }

  return false;
};

export const boundingBoxCorners = ([a, b, c, d]: BoundingBox): Record<Direction, Point> => {
  return {
    [Direction.NorthEast]: a,
    [Direction.East]: mid(a, b),
    [Direction.SouthEast]: b,
    [Direction.South]: mid(b, c),
    [Direction.SouthWest]: c,
    [Direction.West]: mid(c, d),
    [Direction.NorthWest]: d,
    [Direction.North]: mid(d, a),
  }
};

export const boundingBoxArea = ([a, b, c]: BoundingBox) => {
  return (b[1] - a[1]) * (b[0] - c[0]);
};
