import { webSafeColors } from "../data/colors";
import { Color } from "../types/Color";

export const isTransparent = (color: Color): boolean => {
  return color.a === 0;
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
      return {
        r: -1,
        g: -1,
        b: -1,
        a: -1,
      };
    }
  }
};

export const toHex = (color: Color, includeAlpha = true) => {
  const r = color.r.toString(16).padStart(2, "0");
  const g = color.g.toString(16).padStart(2, "0");
  const b = color.b.toString(16).padStart(2, "0");
  if (includeAlpha) {
    const a = Math.round(color.a * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  } else {
    return `#${r}${g}${b}`;
  }
};

export const getColorName = (color: Color) => {
  if (isTransparent(color)) {
    return "Transparent";
  }
  const name = findClosestWebSafeColorName(color);
  return `${name.slice(0, 1).toUpperCase()}${name.slice(1, name.length).toLowerCase()}`;
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
      };
    }
  }
  return closestColorName;
};

export const isSameColor = (self: Color, other: Color) => {
  return (
    self.r === other.r &&
    self.g === other.g &&
    self.b === other.b &&
    self.a === other.a
  );
};

export const isBlackOpaque = (color: Color): boolean => {
  return color.r === 0 && color.g === 0 && color.b === 0 && color.a === 1;
};

export const rgba = (r: number, g: number, b: number, a: number): Color => {
  return { r, g, b, a };
};

export const rgb = (r: number, g: number, b: number): Color => {
  return rgba(r, g, b, 1);
};

export const diffColor = (self: Color, other: Color) => {
  return Math.sqrt(
    Math.pow(self.r - other.r, 2) +
      Math.pow(self.g - other.g, 2) +
      Math.pow(self.b - other.b, 2)
  );
};

export const Red = rgb(255, 0, 0);
export const Yellow = rgb(255, 255, 0);
export const Green = rgb(0, 255, 0);
export const Aqua = rgb(0, 255, 255);
export const Cyan = Aqua;
export const Blue = rgb(0, 0, 255);
export const Magenta = rgb(255, 0, 255);
export const Fuchsia = Magenta;
export const Teal = rgb(128, 128, 128);
export const Black = rgb(0, 0, 0);
export const White = rgb(255, 255, 255);
export const WhiteOpaque = rgba(255, 255, 255, 1);
export const WhiteTransparent = rgba(255, 255, 255, 0);
export const BlackOpaque = rgba(0, 0, 0, 1);
export const BlackTransparent = rgba(0, 0, 0, 0);
