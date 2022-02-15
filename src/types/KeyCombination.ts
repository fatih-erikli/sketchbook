import { Action } from "./Action";

type Keys =
| "KeyP"
| "KeyV"
| "Enter"
| "Shift+Enter"
| "Meta+KeyZ"
| "Meta+Shift+KeyZ"
| "Backspace"
| "Escape";

export type KeyCombination = [Keys, string, Action];
