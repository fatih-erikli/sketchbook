import { Geometry, Vec3 } from "./Sketch";

export enum ActionType {
  CreateSegment,
  AddToHistory,
};

export type Action = {
  type: ActionType.CreateSegment;
  position: Vec3;
} | {
  type: ActionType.AddToHistory;
  shapes: Geometry[];
  selectedShapes: number[];
  currentShape: number;
};
