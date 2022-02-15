export type HistoryItem<S> = {
  hasChange: boolean;
  added: [path: string, value: any][];
  removed: [path: string, value: any][];
  changed: [path: string, value: any, previousValue?: any][];
  updated?: [value: S, previousValue: S];
};
