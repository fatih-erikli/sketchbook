export type Color = Uint8ClampedArray;
export type VectorId = string;
export type Position = [number, number];
export enum VectorType {
  Vertex,
  ControlPoint,
};
export type Vertex = {
  id: VectorId;
  position: Position;
  type: VectorType.Vertex;
  controlPoints: VectorId[];
}
export type ControlPointLeft = {
  id: VectorId;
  position: Position;
  type: VectorType.ControlPoint;
  isLeft: true;
}
export type ControlPointRight = {
  id: VectorId;
  position: Position;
  type: VectorType.ControlPoint;
  isRight: true;
}
export type Vector = Vertex | ControlPointLeft | ControlPointRight;
export type Shape = {
  vectors: Vector[];
  stroke: Color;
  lineWidth: number;
};
export enum CanvasMode {
  Draw,
  Select,
  Reposition,
  Close,
  Reset,
  Save,
  Restore,
}
export type BoundingBox = [Position, Position];
export enum ChangeLogEntryType {
  FinalizeShape,
  CreateVectors,
  DeleteVector,
  SelectShapes,
  DeleteShapes,
};
export type ChangeLogEntry = {
  type: ChangeLogEntryType.FinalizeShape;
} | {
  type: ChangeLogEntryType.CreateVectors;
  vectors: Vector[];
} | {
  type: ChangeLogEntryType.DeleteVector;
  vector: Vector;
} | {
  type: ChangeLogEntryType.SelectShapes;
  shapeIndexes: number[];
} | {
  type: ChangeLogEntryType.DeleteShapes,
  shapes: Shape[];
};
