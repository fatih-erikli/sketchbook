import "./styles/App.css";
import "./styles/MediaQueries.css";
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
import {
  CanvasFeedback,
  CanvasFeedbackType,
  Color,
  EdgeElement,
  Geometry,
  PlaneType,
  Shape,
  Sketch,
  SketchElement,
  SketchElementType,
  SketchMode,
  Vec2,
  VertexElement,
} from "./types/Sketch";
import { parseGeometry } from "./parsers/geometry";
import { lerp } from "./utils/lerp";
import { quatFromPointAngle, transformQuat } from "./utils/quat";
import { inverse, lookAt, multiply, ortho } from "./utils/mat4";
import { CanvasWireframe } from "./components/CanvasWireframe";
import { relativeCoordinatesFromHtmlElement } from "./utils/dom";

const vertexShaderUrl = require("./shaders/wireframe-vertex.glsl");
const fragmentShaderUrl = require("./shaders/wireframe-fragment.glsl");
const sampleGeometryUrl = require("./geometries/garden.obj");

function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [sketchMode, setSketchMode] = useState<SketchMode>(
    SketchMode.CreateSketchElement
  );
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [currentSketchElement, setCurrentSketchElement] = useState<
    null | number
  >(null);
  const [hoverElementIndex, setHoverElementIndex] = useState<null | number>(
    null
  );
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
    devicePixelRatio: number;
  } | null>(null);
  const [pointAngle, setPointAngle] = useState<Vec2>(
    () => new Float32Array([0, 0])
  );
  const [isLoading, setIsLoading] = useState(true);
  const width = canvasSize ? canvasSize.width : 600;
  const height = canvasSize ? canvasSize.height : 400;
  const devicePixelRatio = canvasSize ? canvasSize.devicePixelRatio : 1;
  useEffect(() => {
    setIsLoading(false);
  }, []);
  const lerpx = useCallback(
    (x: number) =>
      lerp(
        [0, width],
        [-(devicePixelRatio * width) / 2, (devicePixelRatio * width) / 2],
        x
      ),
    [width, devicePixelRatio]
  );
  const lerpy = useCallback(
    (y: number) =>
      lerp(
        [0, height],
        [(devicePixelRatio * height) / 2, -(devicePixelRatio * height) / 2],
        y
      ),
    [height, devicePixelRatio]
  );
  const projection = useMemo(() => {
    const cameraTarget = new Float32Array([0, 0, 0]);
    const cameraPosition = new Float32Array([0, 0, 1]);
    const projection = ortho(-width, width, -height, height, 4000, -4000);
    // const projection = perspective(170*Math.PI/180, width/height,1, -4000);
    const up = new Float32Array([0, 1, 0]);
    transformQuat(
      cameraPosition,
      quatFromPointAngle(new Float32Array([pointAngle[0], pointAngle[1]]), 64),
      cameraPosition
    );

    const camera = lookAt(cameraPosition, cameraTarget, up);
    const view = inverse(camera);
    return {
      view,
      projection: multiply(view, projection),
      cameraPosition,
      cameraTarget,
    };
  }, [pointAngle, width, height]);
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
  const [planeType, setPlaneType] = useState<PlaneType>(PlaneType.Xy);
  const [previousPosition, setPreviousPosition] = useState(
    () => new Float32Array([0, 0, 0])
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
      switch (planeType) {
        case PlaneType.Perspective: {
          if (canvasRef.current) {
            const parentElement = canvasRef.current.parentElement;
            if (parentElement) {
              setPointAngle(
                ([x, y]) =>
                  new Float32Array([x + event.movementX, y + event.movementY])
              );
            }
          }
          break;
        }
        case PlaneType.Xy: {
          const position = new Float32Array([
            lerpx(x),
            lerpy(y),
            previousPosition[2],
          ]);
          setPreviousPosition(position);
          setElements((elements) =>
            elements.map((element, index) => {
              return index === currentSketchElement
                ? { ...element, controlPoints: [position] }
                : element;
            })
          );
          break;
        }
        case PlaneType.Zy: {
          const position = new Float32Array([
            previousPosition[0],
            lerpy(y),
            -1 * lerpx(x),
          ]);
          setPreviousPosition(position);
          break;
        }
        case PlaneType.Zx: {
          const position = new Float32Array([
            lerpx(x),
            previousPosition[1],
            lerpy(y),
          ]);
          setPreviousPosition(position);
          break;
        }
      }
    },
    [planeType, lerpx, lerpy, previousPosition]
  );
  useEffect(() => {
    switch (planeType) {
      case PlaneType.Xy:
        setPointAngle(new Float32Array([0, 0]));
        break;
      case PlaneType.Zy:
        setPointAngle(new Float32Array([100, 0]));
        break;
      case PlaneType.Zx:
        setPointAngle(new Float32Array([0, 100]));
        break;
    }
  }, [planeType]);
  const [defaultColor, setDefaultColor] = useState<Color>(
    () => new Uint8ClampedArray([0, 0, 0, 1])
  );
  const onPointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const [x, y] = relativeCoordinatesFromHtmlElement(
        event,
        canvasRef.current!
      );
      let position: Float32Array;
      switch (planeType) {
        case PlaneType.Xy: {
          position = new Float32Array([
            lerpx(x),
            lerpy(y),
            previousPosition[2],
          ]);
          setPreviousPosition(position);
          break;
        }
        case PlaneType.Zy: {
          position = new Float32Array([
            previousPosition[0],
            lerpy(y),
            -1 * lerpx(x),
          ]);
          setPreviousPosition(position);
          break;
        }
        case PlaneType.Zx: {
          position = new Float32Array([
            lerpx(x),
            previousPosition[1],
            lerpy(y),
          ]);
          setPreviousPosition(position);
          break;
        }
        default: {
          return;
        }
      }
      switch (sketchMode) {
        case SketchMode.CreateSketchElement: {
          if (hoverElementIndex === 0) {
            const edgeElement: EdgeElement = {
              type: SketchElementType.Edge,
              source: currentSketchElement as number,
              target: 0,
              color: defaultColor,
            };
            setSketchMode(SketchMode.CreateSketchElement);
            setElements([]);
            setShapes((shapes) => [
              ...shapes,
              {
                elements: [...elements, edgeElement],
                stroke: new Uint8ClampedArray([0, 0, 0, 1]),
                fill: new Uint8ClampedArray([0, 0, 0, 0]),
              },
            ]);
            setCurrentSketchElement(null);
            setHoverElementIndex(null);
          } else if (elements.length === 0) {
            const vertexElement: VertexElement = {
              type: SketchElementType.Vertex,
              position,
              controlPoints: [],
            };
            setElements([vertexElement]);
            setCurrentSketchElement(0);
          } else {
            setElements((elements) => {
              const vertexElement: VertexElement = {
                type: SketchElementType.Vertex,
                position,
                controlPoints: [],
              };
              const edgeElement: EdgeElement = {
                type: SketchElementType.Edge,
                source: currentSketchElement as number,
                target: elements.length + 1,
                color: defaultColor,
              };
              return [...elements, edgeElement, vertexElement];
            });
            setCurrentSketchElement(
              (currentSketchElement) => (currentSketchElement as number) + 2
            );
          }
          break;
        }
      }
    },
    [
      lerpx,
      lerpy,
      sketchMode,
      hoverElementIndex,
      elements,
      currentSketchElement,
      planeType,
      previousPosition,
      defaultColor,
    ]
  );
  let showControllers;
  showControllers = planeType !== PlaneType.Perspective;
  const onCanvasFeedbackReceived = (feedback: CanvasFeedback) => {
    switch (feedback.type) {
      case CanvasFeedbackType.OnVertexOver:
        setHoverElementIndex(feedback.index);
        break;
      case CanvasFeedbackType.OnVertexOut:
        setHoverElementIndex(null);
        break;
    }
  };
  const onChangeColor = (color: Color) => {
    setDefaultColor(color);
  };
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Enter": {
          setSketchMode(SketchMode.CreateSketchElement);
            setElements([]);
            setShapes((shapes) => [
              ...shapes,
              {
                elements: elements,
                stroke: new Uint8ClampedArray([0, 0, 0, 1]),
                fill: new Uint8ClampedArray([0, 0, 0, 0]),
              },
            ]);
            setCurrentSketchElement(null);
            setHoverElementIndex(null);
          break;
        }
      }
    };
    document.body.addEventListener('keypress', onKeyPress);
    return () => {
      document.body.removeEventListener('keypress', onKeyPress);
    }
  }, [elements]);
  return (
    <div className="Container">
      <div className={"Header"}>
        <div id="Logo"></div>
        <h1>Sketchbook</h1>
      </div>
      <Toolbar
        planeType={planeType}
        onPlaneTypeChange={setPlaneType}
        documentColors={[
          new Uint8ClampedArray([255, 255, 255, 0]),
          new Uint8ClampedArray([0, 0, 0, 1]),
        ]}
        onChangeColor={onChangeColor}
        defaultColor={defaultColor}
      />
      <div
        className="Canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        ref={canvasRef}
      >
        {isLoading ? (
          <progress />
        ) : (
          <>
            <CanvasWireframe
              shapes={shapes}
              onCanvasFeedback={onCanvasFeedbackReceived}
              showControllers={showControllers}
              projection={projection}
              devicePixelRatio={devicePixelRatio}
              width={width}
              height={height}
              elements={elements}
              hoverElementIndex={hoverElementIndex}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
