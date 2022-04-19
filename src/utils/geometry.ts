export const makeUnitSquare = () => [
  -1, 1, 0, -1, -1, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0,
];

export const makeSquare = (position: Float32Array, size: number): Float32Array => {
  const square = makeUnitSquare();
  let result = new Float32Array(square.length);
  for (let i = 0; i < square.length; i += 3) {
    result[i] = position[0] + (size * square[i]);
    result[i+1] = position[1] + (size * square[i+1]);
    result[i+2] = position[2] + (size * square[i+2]);
  }
  return result;
};
