import { FC, PointerEventHandler, useCallback } from "react";
import styled from "styled-components";
import { BoundingBox } from "../types/Canvas";
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

const Svg = styled.svg`
  position: absolute;
`;

const Line = styled.line`
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
  selectionBoundingBox: BoundingBox | null;
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
  selectionBoundingBox,
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
          controlPoints: element.controlPoints.map((controlPoint) =>
            transformByMat4(controlPoint, projection.view)
          ),
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
    <Svg
      width={width}
      height={height}
    > 
      {showControllers &&
        vertexes.map((vertex, index) => {
          return (
            <g key={index}>
              <rect
                onPointerOver={onPointerOver}
                onPointerOut={onPointerOut}
                data-vertex-index={index}
                fill={"transparent"}
                stroke={"black"}
                x={lerpx(vertex.position[0]) - 2}
                y={lerpy(vertex.position[1]) - 2}
                width={4}
                height={4}
              />
              {vertex.controlPoints.map((controlPoint, index) => (
                <rect
                  key={index}
                  data-vertex-index={index}
                  fill={"transparent"}
                  stroke={"black"}
                  x={lerpx(controlPoint[0]) - 2}
                  y={lerpy(controlPoint[1]) - 2}
                  width={4}
                  height={4}
                />
              ))}
            </g>
          );
        })}
      {edges.map((edge, index) => {
        return (
          <Line
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
                <Line
                  key={index}
                  stroke={toHex(edge.color)}
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
    </Svg>
  );
};
