export const lerp = (
  [minIn, maxIn]: [number, number],
  [minOut, maxOut]: [number, number],
  input: number,
  clamp = false
) => {
  let inRange = maxIn - minIn;
  let outRange = maxOut - minOut;

  if (clamp) {
    input = (input - minIn) % inRange;
  } else {
    input = input - minIn;
  }
  return (input / inRange) * outRange + minOut;
};

export const linearInterpolation = (
  [minIn, maxIn]: [number, number],
  [minOut, maxOut]: [number, number],
  clamp = false
) => {
  let inRange = maxIn - minIn;
  let outRange = maxOut - minOut;
  return (i: number) => {
    if (clamp) {
      i = (i - minIn) % inRange;
    } else {
      i = i - minIn;
    }
    return (i / inRange) * outRange + minOut;
  };
};
