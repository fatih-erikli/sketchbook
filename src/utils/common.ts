export { v4 as uuidv4 } from "uuid";

export const partial = <T>(object: T, patch: Partial<T>) => {
  return {
    ...object,
    ...patch,
  };
};

export const concat = <T>(array: T[], ...insertion: T[]) => {
  return [...array, ...insertion];
};

export const patchById = <T extends { id: any }>(array: T[], patch: T) => {
  return array.map((value) => (patch.id === value.id ? patch : value));
};

export const without = <T extends { id: any }>(array: T[], object: T) => {
  return array.filter((value) => (object.id !== value.id));
};
