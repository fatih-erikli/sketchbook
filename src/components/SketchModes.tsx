import { useState } from "react";
import styled from "styled-components";
import { CanvasMode } from "../types/Canvas";
import { Icon } from "./Icon";

const SketchModesRadioInputList = styled.div`
  position: absolute;
  margin-top: -7.3rem;
  z-index: 8;
`;

const CanvasModes: [CanvasMode, string][] = [
  [CanvasMode.Draw, "Draw"],
  [CanvasMode.Select, "Select"],
  [CanvasMode.Reposition, "Reposition"],
  [CanvasMode.Close, "Close current shape"],
  [CanvasMode.Reset, "Clear sketch"],
];

export const SketchModes = ({
  canvasMode,
  onChange,
}: {
  canvasMode: CanvasMode;
  onChange: (canvasMode: CanvasMode) => void;
}) => {
  const [showSketchModes, setShowSketchModes] = useState<boolean>(false);
  return (
    <div>
      {showSketchModes && (
        <SketchModesRadioInputList>
          {CanvasModes.map(([mode, label], index) => (
            <label key={index}>
              {label}
              <input
                checked={canvasMode === mode}
                value={mode}
                onChange={() => {
                  onChange(mode);
                  setShowSketchModes(false);
                }}
                name={"plane-type"}
                type={"radio"}
              ></input>
            </label>
          ))}
        </SketchModesRadioInputList>
      )}
      <button
        title={"Plane"}
        className="Button Button-ColorPicker ButtonWithLabel"
        onClick={() => {
          setShowSketchModes((showSketchModes) => !showSketchModes);
        }}
      >
        <Icon type={showSketchModes ? "chevron-down" : "chevron-up"} />
        <span style={{marginRight: "0.5rem"}}>{Object.fromEntries(CanvasModes)[canvasMode]}</span>
      </button>
    </div>
  );
};
