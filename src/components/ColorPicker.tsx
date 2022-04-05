import { FC, useEffect, useRef, useState } from "react";
import { Color } from "../types/Color";
import { Gradient } from "../types/Gradient";
import { Point } from "../types/Point";
import {
  Aqua,
  BlackOpaque,
  BlackTransparent,
  Blue,
  getColorName,
  Green,
  isTransparent,
  Magenta,
  Red,
  rgb,
  toHex,
  WhiteOpaque,
  WhiteTransparent,
  Yellow,
} from "../utils/color";
import { Icon } from "./Icon";

export const GradientCanvas: FC<{
  background: Color;
  width: number;
  height: number;
  gradients: Gradient[];
  pickerBorderWidth: number;
  pickerSize: number;
  fixedVerticalPosition?: boolean;
  fixedHorizontalPosition?: boolean;
  initialPickerPosition?: Point;
  onChange?: (color: Color) => void;
  onSelect?: (color: Color) => void;
}> = ({
  background = WhiteTransparent,
  width,
  height,
  gradients,
  pickerBorderWidth,
  pickerSize,
  fixedVerticalPosition = false,
  fixedHorizontalPosition = false,
  initialPickerPosition = [-1, -1],
  onChange = () => {},
  onSelect = () => {},
}) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [pickerPosition, setPickerPosition] = useState<Point>(
    initialPickerPosition
  );
  const drawGradients = () => {
    if (!canvas.current) return;
    const context = canvas.current.getContext("2d");
    if (!context) return;
    context.fillStyle = toHex(background);
    context.fillRect(0, 0, width, height);
    gradients.forEach((gradient) => {
      let gradientVectors: [x0: number, y0: number, x1: number, y1: number];

      switch (gradient.direction) {
        case "to-right":
          gradientVectors = [0, 0, width, 0];
          break;
        case "to-bottom":
        default:
          gradientVectors = [0, 0, 0, height];
          break;
      }

      const linearGradient = context.createLinearGradient(...gradientVectors);

      gradient.colors.forEach((color: Color, index: number) => {
        linearGradient.addColorStop(
          index * (1 / (gradient.colors.length - 1)),
          toHex(color)
        );
      });

      context.fillStyle = linearGradient;
      context.fillRect(0, 0, width, height);
    });
  };
  const setPickerPositionPageCoordinates = (position: Point) => {
    if (!canvas.current) {
      return pickerPosition;
    }
    const boundingBox = canvas.current.getBoundingClientRect();

    let relativePosition = {
      ...pickerPosition,
    };

    if (!fixedHorizontalPosition) {
      relativePosition[0] = position[0] - boundingBox.left - 7;
    }

    if (!fixedVerticalPosition) {
      relativePosition[1] = position[1] - boundingBox.top - 2;
    }

    setPickerPosition(relativePosition);
    return relativePosition;
  };
  const onMouseMove = (event: any) => {
    if (event.buttons === 0) return;
    const position = setPickerPositionPageCoordinates([
      event.clientX,
      event.clientY,
    ]);
    const color = pickColorFromCanvas(position);
    if (color) {
      onChange(color);
    }
  };
  const onMouseDown = (event: any) => {
    if (event.buttons === 0) return;
    const position = setPickerPositionPageCoordinates([
      event.clientX,
      event.clientY,
    ]);
    const color = pickColorFromCanvas(position);
    if (color) {
      onChange(color);
    }
  };
  const onTouchDown = (event: any) => {
    if (event.touches === 0) return;
    const [position] = event.touches;
    setPickerPositionPageCoordinates([position.clientX, position.clientY]);
  };
  const onTouchMove = (event: any) => {
    if (event.touches === 0) return;
    const [firstTouch] = event.touches;
    const position = setPickerPositionPageCoordinates([
      firstTouch.clientX,
      firstTouch.clientY,
    ]);
    const color = pickColorFromCanvas(position);
    if (color) {
      onChange(color);
    }
  };
  const onMouseUp = () => {
    const color = pickColorFromCanvas(pickerPosition);
    if (color) {
      onSelect(color);
    }
  };
  const onTouchEnd = () => {
    const color = pickColorFromCanvas(pickerPosition);
    if (color) {
      onSelect(color);
    }
  };
  const pickColorFromCanvas = (position: Point) => {
    if (!canvas.current) return;
    const context = canvas.current.getContext("2d");
    if (!context) return;
    const colorData = context.getImageData(position[0], position[1], 1, 1)
      .data!;
    if (colorData[3] === 0) {
      return WhiteOpaque;
    }
    const r = colorData[0];
    const g = colorData[1];
    const b = colorData[2];
    return rgb(r, g, b);
  };

  useEffect(drawGradients, [width, height, gradients, background]);

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
      }}
    >
      <div
        style={{
          top: pickerPosition[1] - pickerSize / 2 - pickerBorderWidth,
          left: Math.max(
            Math.min(pickerPosition[0], width - pickerSize * 2),
            -10
          ),
          width: pickerSize,
          height: pickerSize,
          position: "absolute",
          border: `${pickerBorderWidth}px solid white`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      ></div>
      <canvas
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchDown}
        onTouchEnd={onTouchEnd}
        ref={canvas}
        width={width}
        height={height}
      ></canvas>
    </div>
  );
};

export const ColorPicker: FC<{
  documentColors: Color[];
  color: Color;
  onChange: (color: Color) => void;
  label: string;
}> = ({ documentColors, color, onChange, label }) => {
  const [showColorPickerGradients, setShowColorPickerGradients] =
    useState(false);
  const [hue, setHue] = useState<Color>(color);
  const hueGradientWidth = 300;
  const hueGradientHeight = 25;
  const shadeGradientWidth = 300;
  const shadeGradientHeight = 220;
  const pickerSize = 10;
  const pickerBorderWidth = 2;
  const gradientsContainerRef = useRef<HTMLDivElement>(null);

  const handleOnBlur = (event: any) => {
    const target = event.target as HTMLElement;
    let parent = target.parentElement;
    if (target.matches("button")) {
      return;
    }
    while (parent) {
      if (Object.is(gradientsContainerRef.current, parent)) {
        return;
      }
      parent = parent.parentElement;
    }
    setShowColorPickerGradients(false);
  };

  useEffect(() => {
    if (showColorPickerGradients)
      document.body.addEventListener("click", handleOnBlur);
    return () => {
      document.body.removeEventListener("click", handleOnBlur);
    };
  }, [showColorPickerGradients]);
  return (
    <>
      {showColorPickerGradients && (
        <div className={"ColorPicker-Colors"}>
          Document colors
          <div className={"ColorPicker-ColorGrid"}>
            {documentColors.map((color) =>
              isTransparent(color) ? (
                <span
                  aria-label={`Transparent`}
                  onClick={() => onChange(WhiteTransparent)}
                  key={"transparent"}
                  title={getColorName(color)}
                  className={"Transparent"}
                >
                  <svg width={15} height={15}>
                    <line x1={0} y1={15} x2={15} y2={0} stroke={"red"}></line>
                  </svg>
                </span>
              ) : (
                <span
                  key={toHex(color)}
                  onClick={() => onChange(color)}
                  aria-label={`Color ${getColorName(color)}`}
                  title={getColorName(color)}
                  style={{ background: toHex(color) }}
                ></span>
              )
            )}
          </div>
          <div ref={gradientsContainerRef} className={"ColorPicker-Gradients"}>
            <GradientCanvas
              pickerSize={pickerSize}
              pickerBorderWidth={pickerBorderWidth}
              background={hue}
              width={shadeGradientWidth}
              height={shadeGradientHeight}
              onSelect={onChange}
              initialPickerPosition={[shadeGradientWidth - 5, pickerSize + 4]}
              gradients={[
                {
                  direction: "to-right",
                  colors: [WhiteOpaque, WhiteTransparent],
                },
                {
                  direction: "to-bottom",
                  colors: [BlackTransparent, BlackOpaque],
                },
              ]}
            />
            <GradientCanvas
              background={WhiteTransparent}
              width={hueGradientWidth}
              height={hueGradientHeight}
              fixedVerticalPosition={true}
              pickerBorderWidth={pickerBorderWidth}
              pickerSize={pickerSize}
              initialPickerPosition={[
                hueGradientWidth / 2 - pickerSize / 2,
                12,
              ]}
              onChange={(color) => {
                setHue(color);
              }}
              gradients={[
                {
                  direction: "to-right",
                  colors: [Red, Yellow, Green, Aqua, Blue, Magenta],
                },
              ]}
            />
          </div>
        </div>
      )}
      <button
        title={label}
        className="Button Button-ColorPicker ButtonWithLabel"
        onClick={() => setShowColorPickerGradients(!showColorPickerGradients)}
      >
        <Icon type={showColorPickerGradients ? "chevron-down" : "chevron-up"} />
        {getColorName(color)}
        <span
          style={{
            background: isTransparent(color) ? "#ededed" : toHex(color),
          }}
          className="ChosenColor"
        ></span>
      </button>
    </>
  );
};
