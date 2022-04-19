import { crossProduct, normalize, subtractVectors } from "./vector";

export function createIdentity() {
  const out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

export function perspective(
  fieldOfViewInRadians: number,
  aspect: number,
  near: number,
  far: number,
  dst?: Float32Array
) {
  dst = dst || createIdentity();
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  const rangeInv = 1.0 / (near - far);
  dst[0] = f / aspect;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = f;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = (near + far) * rangeInv;
  dst[11] = -1;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = near * far * rangeInv * 2;
  dst[15] = 0;
  return dst;
}

export function lookAt(
  cameraPosition: Float32Array,
  target: Float32Array,
  up: Float32Array,
  dst?: Float32Array
) {
  dst = dst || createIdentity();
  const zAxis = normalize(subtractVectors(cameraPosition, target));
  const xAxis = normalize(crossProduct(up, zAxis));
  const yAxis = normalize(crossProduct(zAxis, xAxis));
  dst[0] = xAxis[0];
  dst[1] = xAxis[1];
  dst[2] = xAxis[2];
  dst[3] = 0;
  dst[4] = yAxis[0];
  dst[5] = yAxis[1];
  dst[6] = yAxis[2];
  dst[7] = 0;
  dst[8] = zAxis[0];
  dst[9] = zAxis[1];
  dst[10] = zAxis[2];
  dst[11] = 0;
  dst[12] = cameraPosition[0];
  dst[13] = cameraPosition[1];
  dst[14] = cameraPosition[2];
  dst[15] = 1;

  return dst;
}

export function inverse(m: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  const tmp_0 = m22 * m33;
  const tmp_1 = m32 * m23;
  const tmp_2 = m12 * m33;
  const tmp_3 = m32 * m13;
  const tmp_4 = m12 * m23;
  const tmp_5 = m22 * m13;
  const tmp_6 = m02 * m33;
  const tmp_7 = m32 * m03;
  const tmp_8 = m02 * m23;
  const tmp_9 = m22 * m03;
  const tmp_10 = m02 * m13;
  const tmp_11 = m12 * m03;
  const tmp_12 = m20 * m31;
  const tmp_13 = m30 * m21;
  const tmp_14 = m10 * m31;
  const tmp_15 = m30 * m11;
  const tmp_16 = m10 * m21;
  const tmp_17 = m20 * m11;
  const tmp_18 = m00 * m31;
  const tmp_19 = m30 * m01;
  const tmp_20 = m00 * m21;
  const tmp_21 = m20 * m01;
  const tmp_22 = m00 * m11;
  const tmp_23 = m10 * m01;

  const t0 =
    tmp_0 * m11 +
    tmp_3 * m21 +
    tmp_4 * m31 -
    (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  const t1 =
    tmp_1 * m01 +
    tmp_6 * m21 +
    tmp_9 * m31 -
    (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  const t2 =
    tmp_2 * m01 +
    tmp_7 * m11 +
    tmp_10 * m31 -
    (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  const t3 =
    tmp_5 * m01 +
    tmp_8 * m11 +
    tmp_11 * m21 -
    (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  dst[0] = d * t0;
  dst[1] = d * t1;
  dst[2] = d * t2;
  dst[3] = d * t3;
  dst[4] =
    d *
    (tmp_1 * m10 +
      tmp_2 * m20 +
      tmp_5 * m30 -
      (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
  dst[5] =
    d *
    (tmp_0 * m00 +
      tmp_7 * m20 +
      tmp_8 * m30 -
      (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
  dst[6] =
    d *
    (tmp_3 * m00 +
      tmp_6 * m10 +
      tmp_11 * m30 -
      (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
  dst[7] =
    d *
    (tmp_4 * m00 +
      tmp_9 * m10 +
      tmp_10 * m20 -
      (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
  dst[8] =
    d *
    (tmp_12 * m13 +
      tmp_15 * m23 +
      tmp_16 * m33 -
      (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
  dst[9] =
    d *
    (tmp_13 * m03 +
      tmp_18 * m23 +
      tmp_21 * m33 -
      (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
  dst[10] =
    d *
    (tmp_14 * m03 +
      tmp_19 * m13 +
      tmp_22 * m33 -
      (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
  dst[11] =
    d *
    (tmp_17 * m03 +
      tmp_20 * m13 +
      tmp_23 * m23 -
      (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
  dst[12] =
    d *
    (tmp_14 * m22 +
      tmp_17 * m32 +
      tmp_13 * m12 -
      (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
  dst[13] =
    d *
    (tmp_20 * m32 +
      tmp_12 * m02 +
      tmp_19 * m22 -
      (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
  dst[14] =
    d *
    (tmp_18 * m12 +
      tmp_23 * m32 +
      tmp_15 * m02 -
      (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
  dst[15] =
    d *
    (tmp_22 * m22 +
      tmp_16 * m02 +
      tmp_21 * m12 -
      (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

  return dst;
}

export function ortho(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  dst?: Float32Array
) {
  dst = dst || createIdentity();
  let lr = 1 / (left - right);
  let bt = 1 / (bottom - top);
  let nf = 1 / (near - far);
  dst[0] = -2 * lr;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = -2 * bt;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 2 * nf;
  dst[11] = 0;
  dst[12] = (left + right) * lr;
  dst[13] = (top + bottom) * bt;
  dst[14] = (far + near) * nf;
  dst[15] = 1;
  return dst;
}

export function fromTranslation(v: Float32Array, dst?: Float32Array) {
  dst = dst || createIdentity();
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = v[0];
  dst[13] = v[1];
  dst[14] = v[2];
  dst[15] = 1;
  return dst;
}

export function fromScaling(v: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  dst[0] = v[0];
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = v[1];
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = v[2];
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}

export function multiply(a: Float32Array, b: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  const a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  const a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  const a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  dst[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dst[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dst[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dst[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  dst[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dst[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dst[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dst[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  dst[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dst[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dst[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dst[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  dst[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dst[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dst[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dst[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return dst;
}

export function fromYRotation(rad: number, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  let s = Math.sin(rad);
  let c = Math.cos(rad);
  dst[0] = c;
  dst[1] = 0;
  dst[2] = -s;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = 1;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = s;
  dst[9] = 0;
  dst[10] = c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}

export function fromXRotation(rad: number, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  let s = Math.sin(rad);
  let c = Math.cos(rad);
  dst[0] = 1;
  dst[1] = 0;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = 0;
  dst[5] = c;
  dst[6] = s;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = -s;
  dst[10] = c;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}

export function fromZRotation(rad: number, dst?: Float32Array) {
  dst = dst || new Float32Array(16);
  let s = Math.sin(rad);
  let c = Math.cos(rad);
  dst[0] = c;
  dst[1] = s;
  dst[2] = 0;
  dst[3] = 0;
  dst[4] = -s;
  dst[5] = c;
  dst[6] = 0;
  dst[7] = 0;
  dst[8] = 0;
  dst[9] = 0;
  dst[10] = 1;
  dst[11] = 0;
  dst[12] = 0;
  dst[13] = 0;
  dst[14] = 0;
  dst[15] = 1;
  return dst;
}

export function getScaling(mat: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  dst[0] = Math.hypot(m11, m12, m13);
  dst[1] = Math.hypot(m21, m22, m23);
  dst[2] = Math.hypot(m31, m32, m33);
  return dst;
}

export function getRotation(mat: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  let scaling = new Float32Array(3);
  getScaling(mat, scaling);
  let is1 = 1 / scaling[0];
  let is2 = 1 / scaling[1];
  let is3 = 1 / scaling[2];
  let sm11 = mat[0] * is1;
  let sm12 = mat[1] * is2;
  let sm13 = mat[2] * is3;
  let sm21 = mat[4] * is1;
  let sm22 = mat[5] * is2;
  let sm23 = mat[6] * is3;
  let sm31 = mat[8] * is1;
  let sm32 = mat[9] * is2;
  let sm33 = mat[10] * is3;
  let trace = sm11 + sm22 + sm33;
  let S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    dst[3] = 0.25 * S;
    dst[0] = (sm23 - sm32) / S;
    dst[1] = (sm31 - sm13) / S;
    dst[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    dst[3] = (sm23 - sm32) / S;
    dst[0] = 0.25 * S;
    dst[1] = (sm12 + sm21) / S;
    dst[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    dst[3] = (sm31 - sm13) / S;
    dst[0] = (sm12 + sm21) / S;
    dst[1] = 0.25 * S;
    dst[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    dst[3] = (sm12 - sm21) / S;
    dst[0] = (sm31 + sm13) / S;
    dst[1] = (sm23 + sm32) / S;
    dst[2] = 0.25 * S;
  }
  return dst;
}
