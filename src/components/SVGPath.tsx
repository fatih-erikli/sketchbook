import { FC, useMemo } from "react";
import { Color, Vector, VectorType, Vertex } from "../types/Canvas";
import { toHex } from "./ColorPicker";

export const SVGPath: FC<{
  points: Vector[];
  stroke: Color;
  lineWidth: number;
}> = ({ points, stroke, lineWidth }) => {
  let svgPath = useMemo(() => {
    const vertexes: Vertex[] = points.filter(
      (vector) => vector.type === VectorType.Vertex
    ) as Vertex[];
    let svgPath = "";
    for (let i = 0; i < vertexes.length; i++) {
      const current = vertexes[i];
      const previous = vertexes[i - 1];
      if (i === 0) {
        svgPath += `M ${current.position[0]},${current.position[1]} `;
      } else if (current.controlPoints.length === 0) {
        svgPath += `L ${current.position[0]},${current.position[1]} `;
      } else if (previous && previous.controlPoints.length !== 0) {
        const leftControlPoint = points.find(
          (vector) => vector.id === previous.controlPoints[0]
        )!;
        const rightControlPoint = points.find(
          (vector) => vector.id === current.controlPoints[1]
        )!;
        svgPath += `C ${leftControlPoint.position[0]},${leftControlPoint.position[1]} ${rightControlPoint.position[0]},${rightControlPoint.position[1]} ${current.position[0]},${current.position[1]}`;
      } else {
        const leftControlPoint = previous;
        const rightControlPoint = points.find(
          (vector) => vector.id === current.controlPoints[1]
        )!;

        svgPath += `C ${leftControlPoint.position[0]},${leftControlPoint.position[1]} ${rightControlPoint.position[0]},${rightControlPoint.position[1]} ${current.position[0]},${current.position[1]} `;
      }
    }
    return svgPath;
  }, [points]);
  return (
    <path
      d={svgPath}
      strokeWidth={lineWidth}
      stroke={toHex(stroke)}
      fill={"transparent"}
    />
  );
};
