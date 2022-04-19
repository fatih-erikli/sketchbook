import { FC, PointerEventHandler, useCallback } from "react";
import styled from "styled-components";
import {
  CanvasFeedback,
  CanvasFeedbackType,
  EdgeElement,
  Projection,
  Shape,
  SketchElement,
  SketchElementType,
  VertexElement,
} from "../types/Sketch";
import { lerp } from "../utils/lerp";
import { transformByMat4 } from "../utils/vector";
import { toHex } from "./ColorPicker";

const SVG = styled.svg`
  position: absolute;
`;

const LINE = styled.line`
  pointer-events: none;
`;

export const CanvasWireframe: FC<{
  shapes: Shape[];
  hoverElementIndex: number | null;
  showControllers: boolean;
  projection: Projection;
  devicePixelRatio: number;
  width: number;
  height: number;
  elements: SketchElement[];
  onCanvasFeedback: (feedback: CanvasFeedback) => void;
}> = ({
  shapes,
  hoverElementIndex,
  showControllers,
  devicePixelRatio,
  width,
  height,
  elements,
  projection,
  onCanvasFeedback,
}) => {
  elements = elements.map((element) => {
    switch (element.type) {
      case SketchElementType.Vertex: {
        const positionProjected = transformByMat4(
          element.position,
          projection.view
        );
        return {
          ...element,
          position: positionProjected,
        };
      }
      default: {
        return element;
      }
    }
  });
  const vertexes = elements.filter(
    (element) => element.type === SketchElementType.Vertex
  ) as VertexElement[];
  const edges = elements.filter(
    (element) => element.type === SketchElementType.Edge
  ) as EdgeElement[];
  const lerpx = useCallback(
    (x: number) =>
      lerp(
        [-(devicePixelRatio * width) / 2, (devicePixelRatio * width) / 2],
        [0, width],
        x
      ),
    [width, devicePixelRatio]
  );
  const lerpy = useCallback(
    (y: number) =>
      lerp(
        [(devicePixelRatio * height) / 2, -(devicePixelRatio * height) / 2],
        [0, height],
        y
      ),
    [height, devicePixelRatio]
  );
  const onPointerOver: PointerEventHandler<SVGRectElement> = (event) => {
    onCanvasFeedback({
      type: CanvasFeedbackType.OnVertexOver,
      index: Number(event.currentTarget.dataset.vertexIndex),
    });
  };
  const onPointerOut: PointerEventHandler<SVGRectElement> = (event) => {
    onCanvasFeedback({
      type: CanvasFeedbackType.OnVertexOut,
      index: Number(event.currentTarget.dataset.vertexIndex),
    });
  };
  return (
    <SVG width={width} height={height}>
      {showControllers &&
        vertexes.map((vertex, index) => {
          return (
            <rect
              onPointerOver={onPointerOver}
              onPointerOut={onPointerOut}
              data-vertex-index={index}
              key={index}
              fill={"transparent"}
              stroke={"black"}
              x={lerpx(vertex.position[0]) - 2}
              y={lerpy(vertex.position[1]) - 2}
              width={4}
              height={4}
            ></rect>
          );
        })}
      {edges.map((edge, index) => {
        return (
          <LINE
            stroke={toHex(edge.color)}
            key={index}
            x1={lerpx((elements[edge.source] as VertexElement).position[0])}
            y1={lerpy((elements[edge.source] as VertexElement).position[1])}
            x2={lerpx((elements[edge.target] as VertexElement).position[0])}
            y2={lerpy((elements[edge.target] as VertexElement).position[1])}
          />
        );
      })}
      {shapes.map((shape, index) => {
        elements = shape.elements;
        elements = elements.map((element) => {
          switch (element.type) {
            case SketchElementType.Vertex: {
              const positionProjected = transformByMat4(
                element.position,
                projection.view
              );
              return {
                ...element,
                position: positionProjected,
              };
            }
            default: {
              return element;
            }
          }
        });
        const edges = elements.filter(
          (element) => element.type === SketchElementType.Edge
        ) as EdgeElement[];
        return (
          <g key={index}>
            {edges.map((edge, index) => {
              return (
                <LINE
                  stroke={toHex(edge.color)}
                  key={index}
                  x1={lerpx(
                    (elements[edge.source] as VertexElement).position[0]
                  )}
                  y1={lerpy(
                    (elements[edge.source] as VertexElement).position[1]
                  )}
                  x2={lerpx(
                    (elements[edge.target] as VertexElement).position[0]
                  )}
                  y2={lerpy(
                    (elements[edge.target] as VertexElement).position[1]
                  )}
                />
              );
            })}
          </g>
        );
      })}
    </SVG>
  );
};
