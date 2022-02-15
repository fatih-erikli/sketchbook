import { Point } from "./Point"

export enum SweepEventEdgeType {
  NORMAL,
  NON_CONTRIBUTING,
  SAME_TRANSITION,
  DIFFERENT_TRANSITION
}

export type SweepEvent = {
  left: boolean;
  point: Point;
  otherEvent: SweepEvent | null;
  isSubject: boolean;
  type: number;
  inOut: boolean;
  otherInOut: boolean;
  prevInResult: SweepEvent | null;
  resultTransition: number;
  otherPos: number;
  outputContourId: number;
  contourId: number;
}

export type Contour = {
  points: Point[],
  holeIds: number[],
  holeOf: null | number;
  depth: null | number;
}
