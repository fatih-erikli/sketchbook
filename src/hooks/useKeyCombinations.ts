import { Dispatch, useEffect } from "react"
import { Action } from "../types/Action";
import { KeyCombination } from "../types/KeyCombination"

export const useKeyCombinations = (keyCombinations: KeyCombination[], dispatch: Dispatch<Action[]>) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const eventCode = [
        event.metaKey && "Meta",
        event.shiftKey && "Shift",
        event.code,
      ]
        .filter(Boolean)
        .join("+");
      for (const keyCombination of keyCombinations) {
        if (keyCombination[0] === eventCode) {
          dispatch([keyCombination[2]]);
        }
      }
    };
    document.body.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.removeEventListener("keydown", onKeyDown);
    };
  });
}
