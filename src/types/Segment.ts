import { Point } from "./Point";

export enum SegmentType {
  MoveToAbsolute,
  MoveToRelative,
  LineToAbsolute,
  LineToRelative,
  CurveToCubicAbsolute,
  CurveToCubicRelative,
  CurveToQuadraticAbsolute,
  CurveToQuadraticRelative,
  HorizontalLineToAbsolute,
  HorizontalLineToRelative,
  VerticalLineToAbsolute,
  VerticalLineToRelative,
  CloseShapeAbsolute,
  CloseShapeRelative,
}

export type QuadraticCurveSegment = [
  type:
    | SegmentType.CurveToQuadraticAbsolute
    | SegmentType.CurveToQuadraticRelative,
  position: Point,
  controlPoints: [Point]
];

export type CubicCurveSegment = [
  type: SegmentType.CurveToCubicAbsolute | SegmentType.CurveToCubicRelative,
  startPosition: Point,
  endPosition: Point,
  controlPoints: [Point, Point],
];

export type MoveToSegment = [
  type: SegmentType.MoveToAbsolute | SegmentType.MoveToRelative,
  position: Point
];

export type LineToSegment = [
  type: SegmentType.LineToAbsolute | SegmentType.LineToRelative,
  position: Point
];

export type CloseShapeSegment = [
  type: SegmentType.CloseShapeAbsolute | SegmentType.CloseShapeRelative,
  position: Point
];

export type Segment =
  | MoveToSegment
  | LineToSegment
  | CloseShapeSegment
  | QuadraticCurveSegment
  | CubicCurveSegment;
