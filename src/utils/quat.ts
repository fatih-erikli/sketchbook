import { Vec2, Vec4 } from "../types/Sketch";

export const quaternionPointAngle = (
  point: Vec2,
  radians: number
): Vec4 => {
  const half = radians / 2.0;
  return new Float32Array([
    point[0] * Math.sin(half),
    point[1] * Math.sin(half),
    0 * Math.sin(half),
    1 * Math.cos(half),
  ]);
};

export const quatFromPointAngle = (
  point: Vec2,
  pixelsPerRadian = 150
): Float32Array => {
  const [ax, ay, az, aw] = quaternionPointAngle(
    new Float32Array([0, 1]),
    point[0] / pixelsPerRadian
  );
  const [bx, by, bz, bw] = quaternionPointAngle(
    new Float32Array([1, 0]),
    point[1] / pixelsPerRadian
  );
  return (new Float32Array([
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by + ay * bw + az * bx - ax * bz,
    aw * bz + az * bw + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ]));
};

export function transformQuat(a: Float32Array, q: Float32Array, dst?: Float32Array) {
  dst = dst || new Float32Array(3);
  let qx = q[0],
  qy = q[1],
  qz = q[2],
  qw = q[3];
  let x = a[0],
  y = a[1],
  z = a[2];
  let uvx = qy * z - qz * y,
  uvy = qz * x - qx * z,
  uvz = qx * y - qy * x;
  let uuvx = qy * uvz - qz * uvy,
  uuvy = qz * uvx - qx * uvz,
  uuvz = qx * uvy - qy * uvx;
  let w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  dst[0] = x + uvx + uuvx;
  dst[1] = y + uvy + uuvy;
  dst[2] = z + uvz + uuvz;
  return dst;
}
