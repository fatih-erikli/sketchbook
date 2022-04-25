import { FC } from "react";
import {
  ControlPointLeft,
  ControlPointRight,
  Vector,
  Vertex,
} from "../types/Canvas";

export const PointCloud: FC<{
  points: Vector[];
}> = ({ points }) => {
  return (
    <g>
      {points.map((point, index) => (
        <g key={index}>
          <circle
            stroke={"black"}
            fill={"transparent"}
            cx={point.position[0]}
            cy={point.position[1]}
            r={2}
          />
          {(point as Vertex).controlPoints &&
            (point as Vertex).controlPoints.map((vertexId) => {
              const vertex: Vector = points.find((vector) => vector.id === vertexId)!;
              return (
                <line key={vertexId} stroke={'gray'} x1={point.position[0]} y1={point.position[1]} x2={vertex.position[0]} y2={vertex.position[1]}></line>
              );
            })}
        </g>
      ))}
    </g>
  );
};
