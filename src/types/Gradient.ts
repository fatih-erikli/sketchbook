import { Color } from "./Color";

export type Gradient = {
  direction: "to-right" | "to-bottom";
  colors: Color[];
};
