export type Color = Uint8ClampedArray;
export enum SketchMode {
  CreateSketchElement,
  SelectElement,
}
export type Geometry = {
  object: string;
  groups: string[];
  material: string;
  data: {
    matrix: Float32Array;
    position: Float32Array;
    normal: Float32Array;
    color: Float32Array;
  };
};
export type SketchGeometries = Geometry[];
export type Vector = [];
export enum SketchElementType {
  Vertex,
  Edge,
}
export type VertexElement = {
  type: SketchElementType.Vertex;
  position: Vec3;
  controlPoints: Vec3[];
};
export type EdgeElement = {
  type: SketchElementType.Edge;
  source: number;
  target: number;
  color: Color;
};
export type SketchElement =
  | VertexElement
  | EdgeElement;
export type Sketch = {
  elements: SketchElement[];
  sketchMode: SketchMode;
  selectedElements: Uint32Array;
  currentSketchElement: number | null;
};
export type Projection = {
  view: Float32Array;
  projection: Float32Array;
  cameraPosition: Float32Array;
  cameraTarget: Float32Array;
};
export type ProgramInfo = {
  program: WebGLProgram;
  textures: Record<string, WebGLTexture>;
};
export type Vec2 = Float32Array;
export type Vec3 = Float32Array;
export type Vec4 = Float32Array;
export type Mat4 = Float32Array;
export type Quat = Float32Array;
export enum CanvasFeedbackType {
  OnVertexOver,
  OnVertexOut,
};
export type OnVertexOverFeedback = {
  type: CanvasFeedbackType.OnVertexOver,
  index: number;
};
export type OnVertexOutFeedback = {
  type: CanvasFeedbackType.OnVertexOut,
  index: number;
};
export type CanvasFeedback = OnVertexOverFeedback | OnVertexOutFeedback;
export type Shape = {
  elements: SketchElement[];
  fill: Color;
  stroke: Color;
}
export enum PlaneType {
  Xy,
  Zy,
  Zx,
  Perspective,
}
