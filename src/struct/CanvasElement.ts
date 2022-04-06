import { CanvasSelection } from "../types/Canvas";
import { CanvasContent } from "../types/CanvasContent";
import { CanvasElement } from "../types/CanvasElement";
import { CanvasMode } from "../types/CanvasMode";
import { Snapshot } from "../types/Snapshot";
import { VectorType } from "../types/Vector";
import { Aqua, Black, Blue, WhiteTransparent } from "../utils/color";
import {
  boundingBoxFromPoints,
  boundingBoxToVectors,
} from "./BoundingBox";
import { getVectorById } from "./Canvas";
import { pointToQuadrilateralVectors } from "./Point";
import { getShapeById, pointsFromShapeIds } from "./Shape";
import { vectorsToPath2d } from "./vector";

export const canvasElement = (
  canvas: Partial<CanvasElement>
): CanvasElement => {
  return {
    htmlId: "defaultId",
    onClick() {},
    onDoubleClick() {},
    onDrag() {},
    onDragEnd() {},
    onMouseMove() {},
    content: [],
    ...canvas,
  };
};

export const canvasContentForPoints = (snapshot: Snapshot): CanvasContent[] => {
  const [mode, shapes, vectors, currentShapeId] = snapshot;
  let canvasContentForPoints: CanvasContent[];
  const currentShape = getShapeById(shapes, currentShapeId);
  switch (mode) {
    case CanvasMode.Draw:
    case CanvasMode.OnVector:
    case CanvasMode.OnLoopSegment:
    case CanvasMode.TranslateVector:
    case CanvasMode.DrawCubicVector:
      if (!currentShape) {
        canvasContentForPoints = [];
        break;
      }
      canvasContentForPoints = currentShape[1]
        .map((vectorId) => getVectorById(vectors, vectorId))
        .map((vector) => {
          if (vector.type === VectorType.Cubic) {
            return [
              vector,
              getVectorById(vectors, vector.left),
              getVectorById(vectors, vector.right),
            ].filter(Boolean);
          } else if (vector.type === VectorType.Quadratic) {
            return [vector, getVectorById(vectors, vector.other)];
          }
          return [vector];
        })
        .reduce((prev, current) => prev.concat(current), [])
        .map((vector) => {
          return [
            vectorsToPath2d(pointToQuadrilateralVectors(vector.position)),
            [
              [
                CanvasMode.OnVector,
                CanvasMode.OnLoopSegment,
                CanvasMode.TranslateVector,
              ].includes(mode)
                ? mode === CanvasMode.OnLoopSegment
                  ? Blue
                  : Aqua
                : WhiteTransparent,
              Black,
              1,
            ],
          ];
        });
      break;
    default:
      canvasContentForPoints = [];
      break;
  }

  return canvasContentForPoints;
};

export const canvasContentForBoundingBoxes = (
  snapshot: Snapshot,
  selection: CanvasSelection,
): CanvasContent[] => {
  const [mode, shapes, vectors] = snapshot;
  let canvasContentForBoundingBoxes: CanvasContent[];
  switch (mode) {
    case CanvasMode.TranslateShape:
    case CanvasMode.Move:
      canvasContentForBoundingBoxes = [
        [
          vectorsToPath2d(
            boundingBoxToVectors(
              boundingBoxFromPoints(
                pointsFromShapeIds(shapes, vectors, selection[1][1])
              )
            )
          ),
          [WhiteTransparent, Black, 1],
        ],
      ];
      break;
    default:
      canvasContentForBoundingBoxes = [];
  }

  return canvasContentForBoundingBoxes;
};
