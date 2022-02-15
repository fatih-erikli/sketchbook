import { BoundingBox } from "./BoundingBox";
import { Point } from "./Point";
import { ShapeId } from "./Shape";
import { Snapshot } from "./Snapshot";

import { Style } from "./Style";
import { VectorId, VectorPositionMatrix, } from "./Vector";

export type Canvas = {
  selection: [
    rect: BoundingBox,
    covers: [VectorId[], ShapeId[]],
  ],
  snapshot: Snapshot,
  past: Snapshot[],
  future: Snapshot[],
  style: Style,
  cursor: Point,
  translatedVectorPositions: VectorPositionMatrix;
};
