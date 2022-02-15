export type Color = {
  r: 0 | 255 | number;
  g: 0 | 255 | number;
  b: 0 | 255 | number;
  a: 0 | 1 | number;
};

export type WhiteColor = Color & {
  r: 255,
  b: 255,
  g: 255,
  a: 1,
};

export type Transparent = Color & {
  r: 0,
  b: 0,
  g: 0,
  a: 0,
};
