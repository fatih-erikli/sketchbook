import "./styles/App.css";
import "./styles/MediaQueries.css";
import styled from "styled-components";
import { Toolbar } from "./components/Toolbar";
import {
  PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { Color } from "./types/Sketch";
import { parseGeometry } from "./parsers/geometry";
import { lerp } from "./utils/lerp";
import { quatFromPointAngle, transformQuat } from "./utils/quat";
import { inverse, lookAt, multiply, ortho } from "./utils/mat4";
import { CanvasWireframe } from "./components/CanvasWireframe";
import { relativeCoordinatesFromHtmlElement } from "./utils/dom";
import {
  BoundingBox,
  CanvasMode,
  ControlPointLeft,
  ControlPointRight,
  Position,
  Shape,
  Vector,
  VectorId,
  VectorType,
  Vertex,
} from "./types/Canvas";
import { PointCloud } from "./components/PointCloud";
import { SVGPath } from "./components/SVGPath";
import { uuidv4 } from "./utils/common";

const Svg = styled.svg``;

function App() {
  const [currentVectorId, setCurrentVectorId] = useState<VectorId | null>(null);
  const [selectedVectorIds, setSelectedVectorIds] = useState<VectorId[]>(
    () => []
  );
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [shapeBuffer, setShapeBuffer] = useState<Shape | null>(null);
  const [positionBuffer, setPositionBuffer] = useState<{
    cursor: Position;
    element: Position[];
  } | null>(null);
  const [mode, setMode] = useState<CanvasMode>(CanvasMode.Draw);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
    devicePixelRatio: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const width = canvasSize ? canvasSize.width : 600;
  const height = canvasSize ? canvasSize.height : 400;
  useEffect(() => {
    setIsLoading(false);
  }, []);
  useEffect(() => {
    const calculate = () => {
      const boundingBox = canvasRef.current!.getBoundingClientRect();
      setCanvasSize({
        width: boundingBox.width,
        height: boundingBox.height,
        devicePixelRatio: window.devicePixelRatio,
      });
    };
    if (canvasRef.current && canvasSize === null) {
      calculate();
    }
    window.addEventListener("resize", calculate);
    return () => {
      window.removeEventListener("resize", calculate);
    };
  }, [canvasSize]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragPosition, setDragPosition] = useState<[number, number] | null>(
    null
  );
  const onPointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.buttons === 0) {
        return;
      }
      const [x, y] = relativeCoordinatesFromHtmlElement(
        event,
        canvasRef.current!
      );
      switch (mode) {
        case CanvasMode.Reposition: {
          if (!positionBuffer) {
            break;
          }
          if (shapeBuffer) {
            setShapeBuffer((shapeBuffer) => {
              return {
                ...shapeBuffer!,
                vectors: shapeBuffer!.vectors.map((vector) => {
                  const selectedVectorIdIndex = selectedVectorIds.indexOf(
                    vector.id
                  );
                  if (selectedVectorIdIndex === -1) {
                    return vector;
                  }
                  return {
                    ...vector,
                    position: [
                      positionBuffer.element[selectedVectorIdIndex][0] +
                        (x - positionBuffer.cursor[0]),
                      positionBuffer.element[selectedVectorIdIndex][1] +
                        (y - positionBuffer.cursor[1]),
                    ],
                  };
                }),
              };
            });
          }
          break;
        }
        case CanvasMode.Draw: {
          setShapeBuffer((shapeBuffer) => {
            return {
              ...(shapeBuffer as Shape),
              vectors: (shapeBuffer as Shape).vectors.reduce<Vector[]>(
                (prev, vector, index, vectors) => {
                  let vectorsToAdd: Vector[] = [];
                  switch (vector.type) {
                    case VectorType.Vertex: {
                      if (
                        vector.id !== currentVectorId ||
                        vector.controlPoints.length > 0
                      ) {
                        vectorsToAdd = vectorsToAdd.concat(vector);
                        break;
                      }
                      const leftControlPointId = uuidv4();
                      const rightControlPointId = uuidv4();
                      vectorsToAdd = [
                        {
                          ...vector,
                          type: VectorType.Vertex,
                          controlPoints: [
                            leftControlPointId,
                            rightControlPointId,
                          ],
                        },
                        {
                          id: leftControlPointId,
                          type: VectorType.ControlPoint,
                          position: [x, y],
                          isLeft: true,
                        },
                        {
                          id: rightControlPointId,
                          type: VectorType.ControlPoint,
                          position: [
                            vector.position[0] + (vector.position[0] - x),
                            vector.position[1] + (vector.position[1] - y),
                          ],
                          isRight: true,
                        },
                      ];
                      break;
                    }
                    case VectorType.ControlPoint: {
                      const currentVector = vectors.find(
                        (vector) => vector.id === currentVectorId
                      ) as Vertex;
                      if (!currentVector.controlPoints.includes(vector.id)) {
                        vectorsToAdd = [vector];
                        break;
                      }
                      if ((vector as ControlPointLeft).isLeft) {
                        vectorsToAdd = [
                          {
                            id: vector.id,
                            isLeft: true,
                            type: VectorType.ControlPoint,
                            position: [x, y],
                          } as ControlPointLeft,
                        ];
                      } else {
                        vectorsToAdd = [
                          {
                            id: vector.id,
                            isRight: true,
                            type: VectorType.ControlPoint,
                            position: [
                              currentVector.position[0] +
                                (currentVector.position[0] - x),
                              currentVector.position[1] +
                                (currentVector.position[1] - y),
                            ],
                          } as ControlPointRight,
                        ];
                      }
                    }
                  }
                  return prev.concat(vectorsToAdd);
                },
                []
              ),
            };
          });
          break;
        }
        case CanvasMode.Select: {
          setDragPosition([x, y]);
          break;
        }
      }
    },
    [mode, currentVectorId, positionBuffer, selectedVectorIds, shapeBuffer]
  );
  const [defaultColor, setDefaultColor] = useState<Color>(
    () => new Uint8ClampedArray([0, 0, 0, 1])
  );
  const [dragStartedPosition, setDragStartedPosition] = useState<
    [number, number] | null
  >(null);
  const onPointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const [x, y] = relativeCoordinatesFromHtmlElement(
        event,
        canvasRef.current!
      );

      let vectorOnPosition: Vector | undefined;

      if (shapeBuffer) {
        vectorOnPosition = shapeBuffer.vectors.find(
          ({ position }) => Math.hypot(position[0] - x, position[1] - y) < 3
        );
      } else {
        vectorOnPosition = undefined;
      }

      switch (mode) {
        case CanvasMode.Select: {
          setDragStartedPosition([x, y]);
          break;
        }
        case CanvasMode.Draw:
          {
            const newVectorId = uuidv4();
            const newVector: Vector = {
              id: newVectorId,
              position: [x, y],
              controlPoints: [],
              type: VectorType.Vertex,
            };
            if (shapeBuffer) {
              setShapeBuffer({
                ...shapeBuffer,
                vectors: [...shapeBuffer.vectors, newVector],
              });
            } else {
              setShapeBuffer({
                vectors: [newVector],
                stroke: defaultColor,
              });
            }
            setCurrentVectorId(newVectorId);
          }
          break;
      }

      if (vectorOnPosition) {
        if (event.shiftKey) {
          if (vectorOnPosition.type === VectorType.ControlPoint) {
            const parent = shapeBuffer!.vectors.find(
              (vector) =>
                vector.type === VectorType.Vertex &&
                vector.controlPoints.includes(vectorOnPosition!.id)
            )! as Vertex;
            setShapeBuffer((shapeBuffer) => ({
              ...shapeBuffer!,
              vectors: shapeBuffer!.vectors
                .map((vector) =>
                  vector.id === parent.id
                    ? { ...vector, controlPoints: [] }
                    : vector
                )
                .filter((vector) => !parent.controlPoints.includes(vector.id)),
            }));
            setCurrentVectorId(null);
          } else if (
            vectorOnPosition.type === VectorType.Vertex &&
            vectorOnPosition.controlPoints.length > 0
          ) {
            setShapeBuffer((shapeBuffer) => ({
              ...shapeBuffer!,
              vectors: shapeBuffer!.vectors.filter(
                (vector) =>
                  vector.id !== vectorOnPosition!.id &&
                  !(vectorOnPosition as Vertex).controlPoints.includes(
                    vector.id
                  )
              ),
            }));
            setCurrentVectorId(null);
          } else {
            setShapeBuffer((shapeBuffer) => ({
              ...shapeBuffer!,
              vectors: shapeBuffer!.vectors.filter(
                (vector) => vector.id !== vectorOnPosition!.id
              ),
            }));
            setCurrentVectorId(null);
          }
        } else {
          setMode(CanvasMode.Reposition);
          let vectorIds;
          if (selectedVectorIds.length > 0) {
            vectorIds = selectedVectorIds;
          } else if (vectorOnPosition.type === VectorType.Vertex) {
            vectorIds = vectorOnPosition.controlPoints.concat(
              vectorOnPosition.id
            );
          } else {
            vectorIds = [vectorOnPosition.id];
          }
          setSelectedVectorIds(vectorIds);
          if (shapeBuffer) {
            setPositionBuffer({
              cursor: [x, y],
              element: vectorIds.map(
                (vectorId) =>
                  shapeBuffer.vectors.find((vector) => vector.id === vectorId)!
                    .position
              ),
            });
          }
        }
      }
    },
    [mode, shapeBuffer, selectedVectorIds, defaultColor]
  );
  const onChangeColor = (color: Color) => {
    setDefaultColor(color);
    if (shapeBuffer) {
      setShapeBuffer({
        ...shapeBuffer,
        stroke: color,
      });
    }
  };
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
        case "Enter": {
          setMode(CanvasMode.Draw);
          if (shapeBuffer) {
            setShapes((shapes) => [...shapes, shapeBuffer]);
          }
          setShapeBuffer({ vectors: [], stroke: defaultColor });
          setCurrentVectorId(null);
          break;
        }
      }
    };
    document.body.addEventListener("keydown", onKeyPress);
    return () => {
      document.body.removeEventListener("keydown", onKeyPress);
    };
  }, [shapeBuffer, defaultColor]);
  let selectionBoundingBox: null | BoundingBox = useMemo(() => {
    if (!dragStartedPosition || !dragPosition) {
      return null;
    }
    const xs = [dragStartedPosition[0], dragPosition[0]];
    const ys = [dragStartedPosition[1], dragPosition[1]];
    return [
      [Math.min(...xs), Math.min(...ys)],
      [Math.max(...xs), Math.max(...ys)],
    ];
  }, [dragPosition, dragStartedPosition]);
  const onPointerUp: PointerEventHandler<HTMLDivElement> = useCallback(() => {
    switch (mode) {
      case CanvasMode.Reposition: {
        setPositionBuffer(null);
        setMode(CanvasMode.Select);
        break;
      }
      case CanvasMode.Select: {
        const [[x1, y1], [x2, y2]] = selectionBoundingBox!;
        if (shapeBuffer) {
          setSelectedVectorIds(
            shapeBuffer.vectors
              .filter(
                (vector) =>
                  vector.position[0] > x1 &&
                  vector.position[0] < x2 &&
                  vector.position[1] > y1 &&
                  vector.position[1] < y2
              )
              .map((vector) => vector.id)
          );
        }
        setDragStartedPosition(null);
        setDragPosition(null);
        break;
      }
    }
  }, [mode, selectionBoundingBox, shapeBuffer]);
  useEffect(() => {
    switch (mode) {
      case CanvasMode.Close: {
        setMode(CanvasMode.Draw);
        if (shapeBuffer) {
          setShapes((shapes) => [...shapes, shapeBuffer]);
        }
        setShapeBuffer({ vectors: [], stroke: defaultColor });
        setCurrentVectorId(null);
      }
    }
  }, [mode, defaultColor, shapeBuffer]);
  return (
    <div className="Container">
      <div className={"Header"}>
        <div id="Logo"></div>
        <h1>Sketchbook</h1>
      </div>
      <Toolbar
        documentColors={[
          new Uint8ClampedArray([255, 255, 255, 0]),
          new Uint8ClampedArray([0, 0, 0, 1]),
        ]}
        onChangeColor={onChangeColor}
        defaultColor={defaultColor}
        onCanvasModeChange={setMode}
        canvasMode={mode}
      />
      <div
        className="Canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={canvasRef}
      >
        {isLoading ? (
          <progress />
        ) : (
          <>
            <Svg
              width={width}
              height={height}
              style={{
                // background: `url(/img.png)`,
                backgroundSize: 600,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center 2px",
              }}
            >
              {selectionBoundingBox && (
                <rect
                  fill={"transparent"}
                  stroke={"black"}
                  x={selectionBoundingBox[0][0]}
                  y={selectionBoundingBox[0][1]}
                  width={
                    selectionBoundingBox[1][0] - selectionBoundingBox[0][0]
                  }
                  height={
                    selectionBoundingBox[1][1] - selectionBoundingBox[0][1]
                  }
                ></rect>
              )}
              {shapeBuffer && (
                <>
                  <PointCloud points={shapeBuffer.vectors} />
                  <SVGPath
                    stroke={shapeBuffer.stroke}
                    points={shapeBuffer.vectors}
                  />
                </>
              )}
              {shapes.map((shape, index) => (
                <SVGPath
                  key={index}
                  stroke={shape.stroke}
                  points={shape.vectors}
                />
              ))}
            </Svg>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
