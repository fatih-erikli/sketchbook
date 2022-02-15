import { CanvasContent } from "./CanvasContent";
import { Point } from "./Point";

export type CanvasElement = {
  htmlId: string;
  content: CanvasContent[],
  onClick: (position: Point, shiftKey: boolean) => void;
  onDoubleClick: (position: Point) => void;
  onDrag: (position: Point, positionWhenStarted: Point, altKey: boolean) => void;
  onDragEnd: (altKey: boolean) => void;
  onMouseMove: (position: Point, altKey: boolean) => void;
};
