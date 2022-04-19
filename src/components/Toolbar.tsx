import { FC } from "react";
import styled from "styled-components";
import { Color, PlaneType } from "../types/Sketch";
import { ColorPicker } from "./ColorPicker";
import { PlaneTypes } from "./PlaneTypes";

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
  planeType: PlaneType;
  onPlaneTypeChange: (planeType: PlaneType) => void;
  onChangeColor: (color: Color) => void;
  defaultColor: Color;
}> = ({
  documentColors,
  planeType,
  onPlaneTypeChange,
  onChangeColor,
  defaultColor,
}) => {
  
  return (
    <Tools>
      <PlaneTypes planeType={planeType} onPlaneTypeChange={onPlaneTypeChange} />
      <ColorPicker
        onChange={(color: Color) => onChangeColor(color)}
        label={"Stroke color"}
        color={defaultColor}
        documentColors={documentColors}
      />
    </Tools>
  );
};
