import { FC } from "react";

export const CanvasRasterized: FC<{
  width: number;
  height: number;
  devicePixelRatio: number;
  vertexShaderSource: string;
  fragmentShaderSource: string;
}> = ({ width, height, vertexShaderSource, fragmentShaderSource }) => {
  return (
    <svg width={width} height={height}>

    </svg>
  );
};
