import { FC } from "react";

const InlineShape: FC<{
  type: "rotate" | "scale";
  x: number;
  y: number;
  rotate?: number;
}> = ({ type, x, y, rotate = 0 }) => {
  switch (type) {
    case "scale":
      return (
        <g
          style={{
            transformOrigin: `${x}px ${y}px`,
            transform: `rotate(${-rotate}deg) scale(1) translate(${
              x - 19
            }px, ${y}px)`,
          }}
        >
          <polyline
            stroke="blue"
            fill="transparent"
            points="24,0 24,6 18,6"
          ></polyline>
        </g>
      );
    case "rotate":
      return (
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: `${x}px ${y}px`,
            transform: `rotate(${-rotate}deg) scale(0.8) translate(${
              x - 12
            }px, ${y + 6}px)`,
          }}
        >
          <path stroke="blue" fill="transparent" d="M 3,3 Q 12,12 21,3"></path>
          <line
            x1={0}
            strokeLinecap="square"
            y1={0}
            x2={7}
            y2={0}
            stroke="blue"
          ></line>
          <line
            x1={0}
            strokeLinecap="square"
            y1={0}
            x2={0}
            y2={7}
            stroke="blue"
          ></line>
          <line
            x1={18}
            strokeLinecap="square"
            y1={0}
            x2={24}
            y2={0}
            stroke="blue"
          ></line>
          <line
            x1={24}
            strokeLinecap="square"
            y1={0}
            x2={24}
            y2={7}
            stroke="blue"
          ></line>
        </g>
      );
  }
};

export default InlineShape;
