import { PointerEvent } from "react";

export const relativeCoordinatesFromHtmlElement = (
  pointerEvent: PointerEvent,
  element: HTMLElement
) => {
  const boundingClientRect = element.getBoundingClientRect();
  return [
    pointerEvent.clientX - boundingClientRect.left,
    pointerEvent.clientY - boundingClientRect.top,
  ];
};
