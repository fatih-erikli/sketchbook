import { Color } from "../types/Color";
import { Style } from "../types/Style";
import { Black, WhiteTransparent } from "../utils/color";

export const style = (
  fill: Color = WhiteTransparent,
  stroke: Color = Black,
  strokeWidth: number = 1
): Style => [fill, stroke, strokeWidth];
