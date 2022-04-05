import { CanvasMode } from "./CanvasMode";
import { Point } from "./Point";
import { ShapeId } from "./Shape";
import { Style } from "./Style";
import { VectorId, VectorPositionMap } from "./Vector";

export enum ActionType {
  Break,
  Continue,
  SwitchMode,
  CreateCubicVector,
  MoveCubicVectorReflections,
  CreateSingularVector,
  CreateShape,
  AssignCurrentVectorToCurrentShape,
  SetOnVectorId,
  MoveVector,
  SetVectorPositionMap,
  BreakCubicCurveReflections,
  FinalizeCurrentShape,
  SetSelectionRectangle,
  ClearSelectionRectangle,
  AddCurrentShapeToSelection,
  SetCurrentShapeId,
  ClearSelection,
  SelectCurrentShapeVectors,
  SelectVectors,
  Undo,
  Redo,
  AddToHistory,
  DeleteVector,
  DeleteShape,
  Deselect,
  SetStrokeColor,
  SetStyle,
};

export type Action =
  | [ActionType.SwitchMode, CanvasMode]
  | [ActionType.CreateCubicVector, Point]
  // -- keep in history
  | [ActionType.MoveCubicVectorReflections, Point]
  | [ActionType.CreateSingularVector, Point]
  | [ActionType.CreateShape]
  | [ActionType.Continue]
  | [ActionType.Break]
  | [ActionType.AssignCurrentVectorToCurrentShape]
  | [ActionType.SetOnVectorId, VectorId, Point]
  | [ActionType.MoveVector, boolean, Point, Point]
  // -- keep in history: FinalizeMoveVector
  | [ActionType.SetVectorPositionMap, VectorPositionMap]
  | [ActionType.BreakCubicCurveReflections]
  | [ActionType.FinalizeCurrentShape]
  | [ActionType.SetSelectionRectangle, Point, boolean, Point]
  | [ActionType.ClearSelectionRectangle]
  | [ActionType.AddCurrentShapeToSelection]
  | [ActionType.SetCurrentShapeId, ShapeId]
  | [ActionType.ClearSelection]
  | [ActionType.SelectCurrentShapeVectors]
  | [ActionType.SelectVectors, VectorId[]]
  | [ActionType.Undo]
  | [ActionType.Redo]
  | [ActionType.AddToHistory]
  | [ActionType.DeleteVector]
  | [ActionType.DeleteShape]
  | [ActionType.Deselect]
  | [ActionType.SetStyle, Style];
