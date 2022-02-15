import { subtract } from "../struct/Point";
import { Point } from "../types/Point";

export const pointFromHTMLBoundingBox = (
  element: SVGElement | HTMLElement
): Point => {
  const rect = element.getBoundingClientRect();
  return [rect.left, rect.top];
};

export const pointFromEventTarget = (
  event: any,
  relativeTo?: SVGElement | HTMLElement
) => {
  let point: Point = [event.clientX, event.clientY];
  if (relativeTo) {
    point = subtract(point, pointFromHTMLBoundingBox(relativeTo));
  }
  return point;
};
