import { FC } from "react";
import { Color } from "../types/Color";
import { Style } from "../types/Style";
import { ColorPicker } from "./ColorPicker";

export const ColorPickers: FC<{
  documentColors: Color[],
  style: Style;
  onStyleChange: (style: Style) => void;
}> = ({
  style,
  onStyleChange,
  documentColors,
}) => {
  return (
    <div className={"ColorPickers"}>
      <ColorPicker
        onChange={(color: Color) => {onStyleChange([color, style[1], style[2]])}}
        label={"Fill color"}
        color={style[0]}
        documentColors={documentColors}
      />
      <ColorPicker
        label={"Stroke color"}
        onChange={(color: Color) => {onStyleChange([style[0], color, style[2]])}}
        color={style[1]}
        documentColors={documentColors}
      />
    </div>
  );
};
