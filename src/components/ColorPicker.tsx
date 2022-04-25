import { FC, MouseEventHandler, useEffect, useRef, useState } from "react";
import { webSafeColors } from "../data/colors";
import { Color } from "../types/Sketch";

import { linearInterpolation } from "../utils/lerp";
import { Icon } from "./Icon";

function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb([h, s, l]: [number, number, number]) {
  var r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

const rgb2hsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

const rad2deg = linearInterpolation([0, 2 * Math.PI], [0, 360]);
const deg2hue = linearInterpolation([0, 360], [0, 1]);
const rho2lum = linearInterpolation([0, 50], [1, 0.85]);
const xy2polar = (x: number, y: number): [number, number] => {
  const phi = Math.atan2(x, y);
  const r = Math.sqrt(x * x + y * y);
  return [r, phi];
};

const ColorWheel = ({ onSelect }: { onSelect: (color: Color) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 532;
  const height = 512;
  const [position, setPosition] = useState([width / 4, height / 4]);
  const [color, setColor] = useState<Uint8ClampedArray>(
    new Uint8ClampedArray([255, 255, 255, 1])
  );
  useEffect(() => {
    const context = canvasRef.current!.getContext("2d")!;

    let img = context.createImageData(width, height);
    let data = img.data;
    for (let x = -width / 2; x < width / 2; x++) {
      for (let y = -height / 2; y < height / 2; y++) {
        let [rho, phi] = xy2polar(x, y);
        let deg = rad2deg(phi);
        let hue = deg2hue(deg);
        let idx = 4 * ((y + height / 2) * width + (x + width / 2));
        let r, g, b;
        if (rho > width) {
          r = g = b = 255;
        } else {
          let lum = rho2lum(rho);
          [r, g, b] = hslToRgb([hue, 1, lum]);
        }
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 250;
      }
    }
    context.putImageData(img, 0, 0);
  }, []);
  const onClick: MouseEventHandler<HTMLCanvasElement> = (event) => {
    if (event.buttons === 0) {
      return;
    }
    const boundingClientRect = canvasRef.current!.getBoundingClientRect();
    const context = canvasRef.current!.getContext("2d")!;
    const x = Math.floor(event.clientX - boundingClientRect.left);
    const y = Math.floor(event.clientY - boundingClientRect.top);
    const imageData = context.getImageData(x * 2, y * 2, 1, 1).data;
    const color = new Uint8ClampedArray([
      imageData[0],
      imageData[1],
      imageData[2],
      255,
    ]);
    setPosition([x, y]);
    setColor(color);
    onSelect(color);
  };
  return (
    <div
      style={{
        width: width / 2,
        position: "relative",
      }}
    >
      <div
        className="color-picker-current-position"
        style={{
          top: position[1] - 8,
          left: position[0] - 8,
          color: toHex(color, false),
        }}
      ></div>
      <canvas
        onMouseDown={onClick}
        onMouseMove={onClick}
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: width / 2, height: height / 2 }}
      ></canvas>
    </div>
  );
};

const isTransparent = (color: Color) => color[3] === 0;

export const getColorName = (color: Color) => {
  if (isTransparent(color)) {
    return "Transparent";
  }
  const name = findClosestWebSafeColorName(color);
  return `${name.slice(0, 1).toUpperCase()}${name
    .slice(1, name.length)
    .toLowerCase()}`;
};

export const rgba = (r: number, g: number, b: number, a: number): Color => {
  return new Uint8ClampedArray([r, g, b, a]);
};

export const rgb = (r: number, g: number, b: number): Color => {
  return new Uint8ClampedArray([r, g, b, 1]);
};

export const parseHex = (hexInput: string): Color => {
  const hexWithoutHash = hexInput.slice(1, hexInput.length);
  const parse = (hex: string): number => parseInt(hex.padStart(2, hex), 16);
  let r;
  let g;
  let b;
  let a;
  switch (hexWithoutHash.length) {
    case 3:
      [r, g, b] = Array.prototype.map.call(hexWithoutHash, parse) as number[];
      return rgb(r, g, b);
    case 6:
      [r, g, b] = [0, 2, 4]
        .map((index) => hexWithoutHash.slice(index, index + 2))
        .map(parse) as number[];
      return rgb(r, g, b);
    case 8:
      [r, g, b, a] = [0, 2, 4, 6]
        .map((index) => hexWithoutHash.slice(index, index + 2))
        .map(parse) as number[];
      return rgba(r, g, b, a / 255);
    default: {
      return rgba(0, 0, 0, 0);
    }
  }
};

export const diffColor = (self: Color, other: Color) => {
  return Math.sqrt(
    Math.pow(self[0] - other[0], 2) +
      Math.pow(self[1] - other[1], 2) +
      Math.pow(self[2] - other[2], 2)
  );
};

export const findClosestWebSafeColorName = (color: Color) => {
  let closestValue = Math.pow(255, 2);
  let closestColorName: string = "white";
  for (const key in webSafeColors) {
    if (Object.prototype.hasOwnProperty.call(webSafeColors, key)) {
      const value = webSafeColors[key];
      const asColor = parseHex(value);
      const distance = diffColor(color, asColor);
      if (distance < closestValue) {
        closestValue = distance;
        closestColorName = key;
      }
    }
  }
  return closestColorName;
};

export const Hue = () => {
  const h = [];
  for (var i = 0; i < 360; i += 30) {
    h.push("hsl(" + (i + 1) + ", " + 100 + "%, " + 50 + "%)");
  }
  return (
    <div>
      <div
        style={{
          accentColor: "black",
          height: "24px",
          background: `linear-gradient(to right, ${h.join(", ")})`,
        }}
      ></div>
    </div>
  );
};

export const toHex = (color: Color, includeAlpha = false) => {
  const r = color[0].toString(16).padStart(2, "0");
  const g = color[1].toString(16).padStart(2, "0");
  const b = color[2].toString(16).padStart(2, "0");
  if (includeAlpha) {
    const a = Math.round(color[3] * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  } else {
    return `#${r}${g}${b}`;
  }
};

export const ColorPicker: FC<{
  documentColors: Color[];
  color: Color;
  onChange: (color: Color) => void;
  label: string;
}> = ({ documentColors, color, onChange, label }) => {
  const [showColorPickerGradients, setShowColorPickerGradients] =
    useState(false);
  const gradientsContainerRef = useRef<HTMLDivElement>(null);

  const handleOnBlur = (event: any) => {
    const target = event.target as HTMLElement;
    let parent = target.parentElement;
    if (target.matches("button, summary")) {
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
          <h3>Color Wheel</h3>
          <div ref={gradientsContainerRef} className={"ColorPicker-Gradients"}>
            <ColorWheel onSelect={(color) => onChange(color)} />
          </div>
          <h3>Document colors</h3>
          <div className={"ColorPicker-ColorGrid"}>
            {documentColors.map((color, index) =>
              isTransparent(color) ? (
                <span
                  aria-label={`Transparent`}
                  onClick={() => onChange(new Uint8ClampedArray([0, 0, 0, 0]))}
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
                  key={index + toHex(color)}
                  onClick={() => onChange(color)}
                  aria-label={`Color ${getColorName(color)}`}
                  title={getColorName(color)}
                  style={{ background: toHex(color) }}
                ></span>
              )
            )}
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
          title={label}
          style={{
            background: "#ededed",
            borderColor: toHex(color),
          }}
          className="ChosenColor"
        ></span>
      </button>
    </>
  );
};
