export const merge = <T>(whole: T, partial: Partial<T>) => ({
  ...whole,
  ...partial,
});
