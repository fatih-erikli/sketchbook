import { Canvas } from "./Canvas";

export type CommandKey =
  | "select-all"
  | "ungroup-objects"
  | "group-objects"
  | "rasterize-selected"
  | "union-selected-objects"
  | "intersect-selected-objects"
  | "difference-selected-objects"
  | "xor-selected-objects"
  | "align-left"
  | "align-right"
  | "align-center"
  | "align-top"
  | "align-middle"
  | "align-bottom"
  | "distribute-horizontally"
  | "distribute-vertically"
  | "send-to-back"
  | "bring-to-front"
  | "delete-selected-shapes"
  | "delete-selected-segments"
  | "segmentify-selected-shape";

export type Command = {
  key: CommandKey;
  label: string;
  apply: (canvas: Canvas) => Canvas;
};
