export function subtractVectors(
  a: Float32Array,
  b: Float32Array,
  dst?: Float32Array
) {
  dst = dst || new Float32Array(3);
  dst[0] = a[0] - b[0];
  dst[1] = a[1] - b[1];
  dst[2] = a[2] - b[2];
  return dst;
}

export function addVectors(
  a: Float32Array,
  b: Float32Array,
  dst?: Float32Array
) {
  dst = dst || new Float32Array(3);
  dst[0] = a[0] + b[0];
  dst[1] = a[1] + b[1];
  dst[2] = a[2] + b[2];
  return dst;
}

export function scaleVector(v: Float32Array, s: number, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  dst[0] = v[0] * s;
  dst[1] = v[1] * s;
  dst[2] = v[2] * s;
  return dst;
}

export function length(v: Float32Array) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function normalize(v: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (length > 0.00001) {
    dst[0] = v[0] / length;
    dst[1] = v[1] / length;
    dst[2] = v[2] / length;
  }
  return dst;
}

export function crossProduct(a: Float32Array, b: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  dst[0] = a[1] * b[2] - a[2] * b[1];
  dst[1] = a[2] * b[0] - a[0] * b[2];
  dst[2] = a[0] * b[1] - a[1] * b[0];
  return dst;
}

export function transformByMat4(a: Float32Array, m: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  let x = a[0],
    y = a[1],
    z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  dst[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  dst[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  dst[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return dst;
}

export function fromRotation(rad: number, axis: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  let x = axis[0],
    y = axis[1],
    z = axis[2];
  let len = Math.hypot(x, y, z);
  let s, c, t;

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  // Perform rotation-specific matrix multiplication
  dst[0] = x * x * t + c;
  dst[1] = y * x * t + z * s;
  dst[2] = z * x * t - y * s;
  dst[3] = 0;
  dst[4] = x * y * t - z * s;
  dst[5] = y * y * t + c;
  dst[6] = z * y * t + x * s;
  dst[7] = 0;
  dst[8] = x * z * t + y * s;
  dst[9] = y * z * t - x * s;
  dst[10] = z * z * t + c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}
