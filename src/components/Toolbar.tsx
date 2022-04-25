import { FC } from "react";
import styled from "styled-components";
import { CanvasMode } from "../types/Canvas";
import { Color } from "../types/Sketch";
import { ColorPicker } from "./ColorPicker";
import { SketchModes } from "./SketchModes";

const Tools = styled.div`
grid-column-start: 1;
grid-column-end: 6;
display: flex;
grid-row-start: 6;
grid-row-end: 2;
justify-content: center;
align-items: flex-end;
padding-bottom: 0.5rem;
`;

export const Toolbar: FC<{
  documentColors: Color[],
  onChangeColor: (color: Color) => void;
  defaultColor: Color;
  onCanvasModeChange: (canvasMode: CanvasMode) => void;
  canvasMode: CanvasMode;
}> = ({
  documentColors,
  onChangeColor,
  defaultColor,
  onCanvasModeChange,
  canvasMode,
}) => {
  return (
    <Tools>
      <SketchModes canvasMode={canvasMode} onChange={onCanvasModeChange}></SketchModes>
      <ColorPicker
        onChange={(color: Color) => onChangeColor(color)}
        label={"Stroke color"}
        color={defaultColor}
        documentColors={documentColors}
      />
    </Tools>
  );
};
