import { Point } from "./Point";

export type VectorId = string;

export enum VectorType {
  Singular,
  Cubic,
  Quadratic,
  Reflection,
}

export type VectorPositionMap = Record<VectorId, Point>;

export type WithPosition = {
  position: Point;
  id: VectorId;
  loopSegment: boolean;
};

export type SingularVector = WithPosition & {
  type: VectorType.Singular,
};

export type ReflectionVector = Omit<WithPosition, "loopSegment"> & {
  type: VectorType.Reflection;
};

export type CubicVector = WithPosition & {
  type: VectorType.Cubic,
  left: VectorId;
  right: VectorId;
};

export type QuadraticVector = WithPosition & {
  type: VectorType.Quadratic;
  other: VectorId;
};

export type Vector =
  | SingularVector
  | ReflectionVector
  | CubicVector
  | QuadraticVector;

export type LoopableVector =
  | SingularVector
  | CubicVector
  | QuadraticVector;
