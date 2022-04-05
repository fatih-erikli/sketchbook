import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { DPI } from "../constants/rendering";
import { distance, PointInvisible } from "../struct/Point";
import { Point } from "../types/Point";
import { Style } from "../types/Style";
import { toHex } from "../utils/color";
import { pointFromEventTarget } from "../utils/point";

export type CanvasDefinition = {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
} | null;

export type CanvasElementProps = {
  onDragEnd: (altKey: boolean) => void;
  onDrag: (position: Point, positionWhenStarted: Point, altKey: boolean) => void;
  onMove: (position: Point, altKey: boolean) => void;
  onClick: (position: Point, shiftKey: boolean) => void;
  onDoubleClick: (position: Point) => void;
  paths: [Path2D, Style][];
};

const CanvasElement = forwardRef<CanvasDefinition, CanvasElementProps>(
  (
    {
      onDrag,
      onDragEnd,
      onMove,
      onClick,
      onDoubleClick,
      paths,
    }: CanvasElementProps,
    forwardedRef: ForwardedRef<CanvasDefinition>
  ) => {
    const [width, setWidth] = useState<number>(512);
    const [height, setHeight] = useState<number>(512);
    const ref = useRef<HTMLCanvasElement>(null);
    const cursorWhenPressed = useRef<Point>(PointInvisible);
    const isDragEndFired = useRef<boolean>(true);
    useImperativeHandle(forwardedRef, () => ({
      canvas: ref.current,
      context: ref.current ? ref.current.getContext("2d") : null,
    }));

    useEffect(() => {
      if (ref.current && ref.current.parentElement) {
        const computedStyle =
          ref.current.parentElement.getBoundingClientRect();
        setHeight(computedStyle.height * DPI);
        setWidth(computedStyle.width * DPI);
      }
    }, []);

    useEffect(() => {
      if (!ref.current) {
        return;
      }
      const context = ref.current.getContext("2d");
      if (!context) {
        return;
      }
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, ref.current.width, ref.current.height);
      context.lineCap = "square";
      context.beginPath();
      for (const [path, style] of paths) {
        const [fill, stroke, strokeWidth] = style;
        context.lineWidth = strokeWidth * DPI;
        context.strokeStyle = toHex(stroke);
        context.fillStyle = toHex(fill);
        context.stroke(path);
        context.fill(path);
      }
    }, [paths]);
    const style = useMemo(() => {
      return {
        width: width / 2,
        height: height / 2,
      }
    }, [width, height]);
    const handleOnDoubleClick = useCallback((event) => {
      if (!ref.current) {
        return;
      }
      onDoubleClick(pointFromEventTarget(event, ref.current));
    }, [onDoubleClick]);
    const handleOnMouseDown = useCallback((event) => {
      if (!ref.current) {
        return;
      }

      cursorWhenPressed.current = pointFromEventTarget(event, ref.current);
    }, []);
    const handleOnMouseMove = useCallback((event) => {
      if (!ref.current) {
        return;
      }

      const cursorCurrentPosition = pointFromEventTarget(
        event,
        ref.current
      );
      const distanceToCursor = distance(
        cursorCurrentPosition,
        cursorWhenPressed.current
      );

      if (
        isDragEndFired.current === false ||
        (event.buttons === 1 && distanceToCursor > 1)
      ) {
        if (isDragEndFired.current === true) {
          isDragEndFired.current = false;
        }
        onDrag(cursorCurrentPosition, cursorWhenPressed.current, event.altKey);
      } else {
        onMove(cursorCurrentPosition, event.altKey);
      }
    }, [onDrag, onMove]);
    const handleOnMouseUp = useCallback((event) => {
      if (!ref.current) {
        return;
      }

      const cursorCurrentPosition = pointFromEventTarget(
        event,
        ref.current
      );

      if (isDragEndFired.current) {
        onClick(cursorCurrentPosition, event.shiftKey);
      } else {
        onDragEnd(event.altKey);
        isDragEndFired.current = true;
      }

      if (!isDragEndFired.current) {
        isDragEndFired.current = true;
      }

      if (cursorWhenPressed.current) {
        cursorWhenPressed.current = PointInvisible;
      }
    }, [onClick, onDragEnd]);
    return (
      <canvas
        className={'AbsolutePosition'}
        ref={ref}
        onDoubleClick={handleOnDoubleClick}
        onMouseDown={handleOnMouseDown}
        onMouseMove={handleOnMouseMove}
        onMouseUp={handleOnMouseUp}
        style={style}
        width={width}
        height={height}
      ></canvas>
    );
  }
);

export default CanvasElement;
