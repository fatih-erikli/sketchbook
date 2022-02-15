import { DPI } from "../constants/rendering";
import { Point } from "../types/Point";
import { singularVector } from "./vector";
export const point = (x: number, y: number): Point => {
  return [x, y];
};
export const PointInvisible = point(-1, -1);
export const square = (n: number): Point => [n, n];
export const pointToQuadrilateralVectors = (point: Point, radius = 5) => {
  const halfRadius = radius / 2;
  const center = point;
  return [
    singularVector(subtract(center, [0, -halfRadius])),
    singularVector(subtract(center, [halfRadius, 0])),
    singularVector(subtract(center, [0, halfRadius])),
    singularVector(subtract(center, [-halfRadius, 0])),
    singularVector(subtract(center, [0, -halfRadius])),
  ];
};
export const subtract = (a: Point, b: Point): Point => [
  a[0] - b[0],
  a[1] - b[1],
];
export const add = (a: Point, b: Point): Point => [
  a[0] + b[0],
  a[1] + b[1],
];
export const multiply = (a: Point, b: Point): Point => [
  a[0] * b[0],
  a[1] * b[1],
];
export const crossProduct = (a: Point, b: Point): number =>
  a[0] * b[0] + a[1] * b[1];
export const dotProduct = (a: Point, b: Point): number => sum(multiply(a, b));
export const power = (point: Point): Point =>
  point.map((number) => number ** 2);
export const sum = (point: Point): number => point[0] + point[1];
export const distance = (a: Point, b: Point) =>
  Math.sqrt(sum(power(subtract(a, b))));
export const applyDPI = (point: Point) => multiply(point, [DPI, DPI]);
export const mid = (a: Point, b: Point) => multiply(add(a, b), [0.5, 0.5])
export const {max, min} = Math;
