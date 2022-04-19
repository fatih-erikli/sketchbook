import { useState } from "react";
import styled from "styled-components";
import { PlaneType } from "../types/Sketch";
import { Icon } from "./Icon";

const PlaneTypesRadioInputList = styled.div`
  position: absolute;
  margin-top: -6.2rem;
  z-index: 8;
`;

export const PlaneTypes = ({
  planeType,
  onPlaneTypeChange,
}: {
  planeType: PlaneType;
  onPlaneTypeChange: (planeType: PlaneType) => void;
}) => {
  const [showPlaneTypes, setShowPlaneTypes] = useState<boolean>(false);
  const planeTypes = [PlaneType.Xy, PlaneType.Zy, PlaneType.Zx, PlaneType.Perspective];
  return (
    <div>
      {showPlaneTypes && (
        <PlaneTypesRadioInputList>
          {planeTypes.map((_, index) => (
            <label key={index}>
              {PlaneType[index]}
              <input
                checked={planeType === index}
                value={planeType}
                onChange={() => onPlaneTypeChange(index)}
                name={"plane-type"}
                type={"radio"}
              ></input>
            </label>
          ))}
        </PlaneTypesRadioInputList>
      )}
      <button
        title={"Plane"}
        className="Button Button-ColorPicker ButtonWithLabel"
        onClick={() => {
          setShowPlaneTypes((showPlaneTypes) => !showPlaneTypes);
        }}
      >
        <Icon type={showPlaneTypes ? "chevron-down" : "chevron-up"} />
        XY Plane
      </button>
    </div>
  );
};
