import classNames from "classnames";
import { FC } from "react";
import { BooleanOperation } from "../types/BooleanOperation";
import { Icon } from "./Icon";

const GroupActions: FC<{
  onChange: (booleanOperation: BooleanOperation) => void;
  currentValue: BooleanOperation;
  disabled: boolean;
}> = ({
  onChange,
  currentValue,
  disabled,
}) => {
  return (
    <>
      <button
        disabled={disabled}
        className={classNames("Button", "IconOnly", {
          Chosen: currentValue === BooleanOperation.Union,
        })}
        title="Union"
        aria-label="Union"
        onClick={() => onChange(BooleanOperation.Union)}
      >
        <Icon type="union" /> Union
      </button>
      <button
        disabled={disabled}
        className={classNames("Button", "IconOnly", {
          Chosen: currentValue === BooleanOperation.Difference,
        })}
        title="Subtract"
        aria-label="Subtract"
        onClick={() => onChange(BooleanOperation.Difference)}
      >
        <Icon type="subtract" /> Subtract
      </button>
      <button
        disabled={disabled}
        className={classNames("Button", "IconOnly", {
          Chosen: currentValue === BooleanOperation.Intersect,
        })}
        title="Intersect"
        aria-label="Intersect"
        onClick={() => onChange(BooleanOperation.Intersect)}
      >
        <Icon type="intersect" /> Intersection
      </button>
      <button
        disabled={disabled}
        className={classNames("Button", "IconOnly", {
          Chosen: currentValue === BooleanOperation.Difference,
        })}
        title="Exclude"
        aria-label="Exclude"
        onClick={() => onChange(BooleanOperation.Difference)}
      >
        <Icon type="exclude" /> Difference
      </button>
    </>
  );
};

export default GroupActions;
