import { BoundingBox } from "./BoundingBox";
import { Point } from "./Point";
import { ShapeId } from "./Shape";
import { Snapshot } from "./Snapshot";

import { Style } from "./Style";
import { VectorId, VectorPositionMap, } from "./Vector";

export type CanvasSelection = [
  rect: BoundingBox,
  covers: [VectorId[], ShapeId[]],
];

export type Canvas = {
  selection: CanvasSelection,
  snapshot: Snapshot,
  past: Snapshot[],
  future: Snapshot[],
  style: Style,
  cursor: Point,
  translatedVectorPositions: VectorPositionMap;
};
