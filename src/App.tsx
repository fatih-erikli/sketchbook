import { useMemo, useReducer } from "react";
import { CanvasMode } from "./types/CanvasMode";

import { Translate } from "./i18n/strings";
import { Action, ActionType } from "./types/Action";
import { KeyCombination } from "./types/KeyCombination";
import { useKeyCombinations } from "./hooks/useKeyCombinations";

import "./styles/App.css";
import "./styles/MediaQueries.css";
import { ColorPickers } from "./components/ColorPickers";
import { Canvas } from "./types/Canvas";
import {
  canvas,
  defaultCanvas,
  getVectorById,
  EmptyDocumentNewShapeId,
  updateVectorsById,
} from "./struct/Canvas";
import { CanvasElement } from "./types/CanvasElement";
import {
  canvasContentForBoundingBoxes,
  canvasContentForPoints,
  canvasElement,
} from "./struct/CanvasElement";
import HtmlCanvas from "./components/Canvas";
import { Point } from "./types/Point";
import { uuidv4 } from "./utils/common";
import { Shape } from "./types/Shape";
import {
  buildVectorPositionMap,
  cubicVector,
  findVectorCloserTo,
  getShapeOfVector,
  isLoopableVectorType,
  reflectionVector,
  singularVector,
  vectorsToPath2d,
  EmptyDocumentNewVectorId,
} from "./struct/vector";
import { subtract } from "./struct/Point";
import {
  CubicVector,
  LoopableVector,
  QuadraticVector,
  ReflectionVector,
  VectorType,
} from "./types/Vector";
import { getShapeById } from "./struct/Shape";
import {
  boundingBox,
  boundingBoxArea,
  boundingBoxFromPoints,
  boundingBoxFromVectorPairs,
  boundingBoxIntersects,
  boundingBoxToVectors,
  isPointInBoundingBox,
} from "./struct/BoundingBox";
import { Black, parseHex, toHex, WhiteTransparent } from "./utils/color";
import { CanvasContent } from "./types/CanvasContent";

const keyCombinations: KeyCombination[] = [
  ["KeyP", Translate.STD, [ActionType.SwitchMode, CanvasMode.Draw]],
  ["KeyV", Translate.STM, [ActionType.SwitchMode, CanvasMode.Move]],
  ["Meta+KeyZ", Translate.UND, [ActionType.Undo]],
  ["Meta+Shift+KeyZ", Translate.RDO, [ActionType.Redo]],
  ["Backspace", Translate.DLT, [ActionType.DeleteShape]],
  ["Escape", Translate.DST, [ActionType.Deselect]],
];

const reducer = (state: Canvas, actions: Action[]) => {
  actionsLoop: for (const action of actions) {
    switch (action[0]) {
      case ActionType.Break:
        break actionsLoop;
      case ActionType.Continue:
        continue;
      case ActionType.SetStyle: {
        const [, shapes, vectors, currentShapeId, currentVectorId] =
          state.snapshot;
        const selectedShapeId = state.selection[1][1][0];
        const shape = getShapeById(shapes, selectedShapeId);
        if (!shape) {
          break;
        }
        state = canvas(state, {
          style: action[1],
          snapshot: [
            CanvasMode.Move,
            shapes.map(([shapeId, vectors, style]) => [
              shapeId,
              vectors,
              shapeId === selectedShapeId ? action[1] : style,
            ]),
            vectors,
            currentShapeId,
            currentVectorId,
          ],
        });
        break;
      }
      case ActionType.Deselect: {
        const [, shapes, vectors] = state.snapshot;
        state = canvas(state, {
          selection: [boundingBox(), [[], []]],
          snapshot: [
            CanvasMode.Move,
            shapes,
            vectors,
            EmptyDocumentNewShapeId,
            EmptyDocumentNewVectorId,
          ],
        });
        break;
      }
      case ActionType.DeleteShape: {
        const [mode, shapes, vectors, currentShapeId, currentVectorId] =
          state.snapshot;
        const shapeIds = state.selection[1][1];
        state = canvas(state, {
          selection: [boundingBox(), [[], []]],
          snapshot: [
            mode,
            shapes.filter((shape) => !shapeIds.includes(shape[0])),
            vectors,
            currentShapeId,
            currentVectorId,
          ],
        });
        break;
      }
      case ActionType.Undo:
        const snapshot = state.past[0];
        if (snapshot) {
          state = canvas(state, {
            future: [state.snapshot, ...state.future],
            snapshot,
            past: state.past.slice(1),
          });
        }
        break;
      case ActionType.Redo: {
        const snapshot = state.future[0];
        if (snapshot) {
          state = canvas(state, {
            past: [state.snapshot, ...state.past],
            future: state.future.slice(1),
            snapshot,
          });
        }
        break;
      }
      case ActionType.AddToHistory: {
        state = canvas(state, {
          past: [state.snapshot, ...state.past],
          future: [],
        });
        break;
      }
      case ActionType.DeleteVector: {
        const [vectorId] = state.selection[1][0];
        const [mode, shapes, vectors, currentShapeId, currentVectorId] =
          state.snapshot;
        state = canvas(state, {
          snapshot: [
            mode,
            shapes.map(([shapeId, vectorIds, style]) => [
              shapeId,
              vectorIds.filter((id) => id !== vectorId),
              style,
            ]),
            vectors
              .filter((vector) => vector.id !== vectorId)
              .map((vector) => {
                switch (vector.type) {
                  case VectorType.Cubic:
                    if (vector.left === vectorId || vector.right === vectorId) {
                      return {
                        id: vector.id,
                        type: VectorType.Quadratic,
                        position: vector.position,
                        other:
                          vector.left === vectorId ? vector.right : vector.left,
                      } as QuadraticVector;
                    }
                    break;
                  case VectorType.Quadratic:
                    if (vector.other === vectorId) {
                      return {
                        id: vector.id,
                        type: VectorType.Singular,
                        position: vector.position,
                        loopSegment: false,
                      };
                    }
                    break;
                  default:
                    break;
                }
                return vector;
              }),
            currentShapeId,
            currentVectorId,
          ],
        });
        break;
      }
      case ActionType.SelectCurrentShapeVectors: {
        const [, shapes, , currentShapeId] = state.snapshot;
        const shape = getShapeById(shapes, currentShapeId);
        state = canvas(state, {
          selection: [state.selection[0], [shape[1], [currentShapeId]]],
        });
        break;
      }
      case ActionType.SelectVectors:
        state = canvas(state, {
          selection: [state.selection[0], [action[1], state.selection[1][1]]],
        });
        break;
      case ActionType.SetOnVectorId:
        state = canvas(state, {
          selection: [state.selection[0], [[action[1]], state.selection[1][1]]],
        });
        break;
      case ActionType.SetCurrentShapeId: {
        const [mode, shapes, vectors, , currentVectorId] = state.snapshot;
        state = canvas(state, {
          selection: [boundingBox(), [[], [action[1]]]],
          snapshot: [mode, shapes, vectors, action[1], currentVectorId],
        });
        break;
      }
      case ActionType.ClearSelection: {
        const [mode, shapes, vectors, ,] = state.snapshot;
        state = canvas(state, {
          snapshot: [mode, shapes, vectors, EmptyDocumentNewShapeId, EmptyDocumentNewVectorId],
          selection: [boundingBox(), [[], []]],
        });
        break;
      }
      case ActionType.ClearSelectionRectangle:
        state = canvas(state, {
          selection: [boundingBox(), state.selection[1]],
        });
        break;
      case ActionType.SetSelectionRectangle: {
        const [, shapes, vectors] = state.snapshot;
        const selectionBoundingBox = boundingBoxFromVectorPairs(
          action[3],
          action[1]
        );
        let smallestBoundingBoxArea: number | null = null;
        let smallestIntersectingShape: Shape | null = null;
        const shapeIds = [];
        for (const shape of shapes) {
          const boundingBox = boundingBoxFromPoints(
            shape[1]
              .map((vectorId) => getVectorById(vectors, vectorId))
              .map((vector) => vector.position)
          );
          if (boundingBoxIntersects(selectionBoundingBox, boundingBox)) {
            shapeIds.push(shape[0]);
            const area = boundingBoxArea(boundingBox);
            if (!smallestBoundingBoxArea || area < smallestBoundingBoxArea) {
              smallestBoundingBoxArea = area;
              smallestIntersectingShape = shape;
            }
          }
        }
        if (action[2] && smallestIntersectingShape) {
          state = canvas(state, {
            selection: [
              selectionBoundingBox,
              [[], [smallestIntersectingShape[0]]],
            ],
          });
        } else {
          state = canvas(state, {
            selection: [selectionBoundingBox, [[], shapeIds]],
          });
        }
        break;
      }
      case ActionType.SetVectorPositionMap: {
        state = canvas(state, { translatedVectorPositions: action[1] });
        break;
      }
      case ActionType.AddCurrentShapeToSelection: {
        const [, , , currentShapeId] = state.snapshot;
        state = canvas(state, {
          selection: [state.selection[0], [[], [currentShapeId]]],
        });
        break;
      }
      case ActionType.FinalizeCurrentShape: {
        const [mode, shapes, vectors] = state.snapshot;
        state = canvas(state, {
          snapshot: [mode, shapes, vectors, EmptyDocumentNewShapeId, EmptyDocumentNewVectorId],
        });
        break;
      }
      case ActionType.MoveCubicVectorReflections: {
        const [mode, shapes, vectors, shapeId, currentVectorId] =
          state.snapshot;
        const vector = getVectorById(vectors, currentVectorId) as CubicVector;
        const left = getVectorById(vectors, vector.left) as ReflectionVector;
        const right = getVectorById(vectors, vector.right) as ReflectionVector;
        const difference = subtract(action[1], vector.position);
        state = canvas(state, {
          snapshot: [
            mode,
            shapes,
            updateVectorsById(vectors, {
              [left.id]: { position: subtract(vector.position, difference) },
              [right.id]: { position: action[1] },
            }),
            shapeId,
            currentVectorId,
          ],
        });
        break;
      }
      case ActionType.MoveVector: {
        for (const vectorId of state.selection[1][0]) {
          const [mode, shapes, vectors, ...rest] = state.snapshot;
          const vector = getVectorById(vectors, vectorId);
          const previousPosition = state.translatedVectorPositions[vector.id];
          const difference = subtract(action[2], action[3]);
          let patchedVectors = updateVectorsById(vectors, {
            [vector.id]: { position: subtract(previousPosition, difference) },
          });
          if (vector.type === VectorType.Reflection && !action[1]) {
            const fromLeft = vectors.find(
              (vector) =>
                vector.type === VectorType.Cubic && vector.left === vectorId
            );
            if (fromLeft) {
              const vectorOnRight = getVectorById(
                vectors,
                (fromLeft as CubicVector).right
              );
              const differenceToOrigin = subtract(action[3], fromLeft.position);
              patchedVectors = updateVectorsById(patchedVectors, {
                [vectorOnRight.id]: {
                  position: subtract(fromLeft.position, differenceToOrigin),
                },
              });
            } else {
              const fromRight = vectors.find(
                (vector) =>
                  vector.type === VectorType.Cubic && vector.right === vectorId
              );
              if (fromRight) {
                const vectorOnLeft = getVectorById(
                  vectors,
                  (fromRight as CubicVector).left
                );
                const differenceToOrigin = subtract(
                  action[3],
                  fromRight.position
                );
                patchedVectors = updateVectorsById(patchedVectors, {
                  [vectorOnLeft.id]: {
                    position: subtract(fromRight.position, differenceToOrigin),
                  },
                });
              }
            }
          } else if (vector.type === VectorType.Cubic) {
            const left = getVectorById(vectors, vector.left);
            const right = getVectorById(vectors, vector.right);
            patchedVectors = updateVectorsById(patchedVectors, {
              [right.id]: {
                position: subtract(
                  state.translatedVectorPositions[right.id],
                  difference
                ),
              },
              [left.id]: {
                position: subtract(
                  state.translatedVectorPositions[left.id],
                  difference
                ),
              },
            });
          }
          state = canvas(state, {
            snapshot: [mode, shapes, patchedVectors, ...rest],
          });
        }
        break;
      }
      case ActionType.SwitchMode:
        const [, mode] = action;
        const [, shapes, vectors, shapeId, vectorId] = state.snapshot;
        state = canvas(state, {
          snapshot: [mode, shapes, vectors, shapeId, vectorId],
        });
        break;
      case ActionType.AssignCurrentVectorToCurrentShape: {
        const [drawingMode, shapes, vectors, currentShapeId, currentVectorId] =
          state.snapshot;
        state = canvas(state, {
          snapshot: [
            drawingMode,
            shapes.map(([shapeId, vectorIds, style]) =>
              shapeId === currentShapeId
                ? [shapeId, vectorIds.concat(currentVectorId), style]
                : [shapeId, vectorIds, style]
            ),
            vectors,
            currentShapeId,
            currentVectorId,
          ],
        });
        break;
      }
      case ActionType.CreateSingularVector: {
        const [drawingMode, shapes, vectors, currentShapeId] = state.snapshot;
        const currentShape = getShapeById(shapes, currentShapeId);
        if (!currentShape) {
          break;
        }
        const vector = singularVector(
          action[1],
          uuidv4(),
          currentShape[1].length === 0
        );
        state = canvas(state, {
          snapshot: [
            drawingMode,
            shapes,
            [...vectors, vector],
            currentShapeId,
            vector.id,
          ],
        });
        break;
      }
      case ActionType.CreateCubicVector: {
        const [drawingMode, shapes, vectors, currentShapeId] = state.snapshot;
        const currentShape = getShapeById(shapes, currentShapeId);
        const vector = cubicVector(
          action[1],
          uuidv4(),
          currentShape[1].length === 0
        );
        const leftReflection = reflectionVector(action[1], uuidv4());
        const rightReflection = reflectionVector(action[1], uuidv4());
        vector.left = leftReflection.id;
        vector.right = rightReflection.id;
        state = canvas(state, {
          snapshot: [
            drawingMode,
            shapes,
            [...vectors, vector, leftReflection, rightReflection],
            currentShapeId,
            vector.id,
          ],
        });
        break;
      }
      case ActionType.CreateShape: {
        const [drawingMode, shapes, vectors, currentShape] = state.snapshot;
        if (currentShape === EmptyDocumentNewShapeId) {
          const shape: Shape = [uuidv4(), [], state.style];
          state = canvas(state, {
            snapshot: [
              drawingMode,
              [...shapes, shape],
              vectors,
              shape[0],
              EmptyDocumentNewVectorId,
            ],
          });
        }
        break;
      }
    }
  }
  return state;
};

function App() {
  const [canvas, dispatch] = useReducer(reducer, defaultCanvas);
  const [mode, shapes, vectors, currentShapeId] = canvas.snapshot;
  useKeyCombinations(keyCombinations, dispatch);
  const selectionRectangleCanvasContent = useMemo((): CanvasContent[] => {
    return [
      [
        vectorsToPath2d(boundingBoxToVectors(canvas.selection[0])),
        [WhiteTransparent, Black, 1],
      ],
    ];
  }, [canvas.selection]);
  const pointsCanvasContent = useMemo(() => {
    return canvasContentForPoints(canvas.snapshot);
  }, [canvas.snapshot]);
  const canvasContentBoundingBoxes = useMemo(() => {
    return canvasContentForBoundingBoxes(canvas.snapshot, canvas.selection);
  }, [canvas.snapshot, canvas.selection]);
  const canvasElements: CanvasElement[] = useMemo(() => {
    return [
      canvasElement({ htmlId: "nextVectorPreview" }),
      canvasElement({
        htmlId: "points",
        content: pointsCanvasContent,
      }),
      canvasElement({
        htmlId: "boundingBoxes",
        content: canvasContentBoundingBoxes,
      }),
      canvasElement({
        htmlId: "selectionRectangle",
        content: selectionRectangleCanvasContent,
      }),
      canvasElement({
        htmlId: "drawing",
        content: canvas.snapshot[1].map(([, vectorIds, style]) => [
          vectorsToPath2d(
            vectorIds.map((vectorId) => getVectorById(vectors, vectorId)),
            vectors
          ),
          style,
        ]),
      }),
      canvasElement({
        htmlId: "eventListeners",
        onMouseMove: (position: Point) => {
          switch (mode) {
            case CanvasMode.OnLoopSegment:
            case CanvasMode.OnVector:
            case CanvasMode.Draw: {
              const currentShape = getShapeById(shapes, currentShapeId);
              if (!currentShape) {
                break;
              }
              const vector = findVectorCloserTo(
                currentShape[1]
                  .map((vectorId) => getVectorById(vectors, vectorId))
                  .map((vector) => {
                    if (vector.type === VectorType.Cubic) {
                      return [
                        vector,
                        getVectorById(vectors, vector.left),
                        getVectorById(vectors, vector.right),
                      ];
                    }
                    return [vector];
                  })
                  .reduce((prev, current) => prev.concat(current), []),
                position
              );
              if (vector) {
                const shape = getShapeOfVector(shapes, vector.id);
                dispatch([
                  [
                    ActionType.SwitchMode,
                    shape &&
                    currentShapeId === shape[0] &&
                    isLoopableVectorType(vector.type) &&
                    (vector as LoopableVector).loopSegment
                      ? CanvasMode.OnLoopSegment
                      : CanvasMode.OnVector,
                  ],
                  [ActionType.SetOnVectorId, vector.id, position],
                ]);
              } else {
                dispatch([
                  [ActionType.SwitchMode, CanvasMode.Draw],
                  [ActionType.SetOnVectorId, EmptyDocumentNewVectorId, position],
                ]);
              }
            }
          }
        },
        onClick: (position: Point, shiftKey: boolean) => {
          switch (mode) {
            case CanvasMode.OnVector: {
              if (shiftKey) {
                dispatch([
                  [ActionType.DeleteVector],
                  [ActionType.AddToHistory],
                ]);
              }
              break;
            }
            case CanvasMode.OnLoopSegment: {
              dispatch([
                [ActionType.AddCurrentShapeToSelection],
                [ActionType.CreateSingularVector, position],
                [ActionType.AssignCurrentVectorToCurrentShape],
                [ActionType.FinalizeCurrentShape],
                [ActionType.SwitchMode, CanvasMode.Move],
                [ActionType.AddToHistory],
              ]);
              break;
            }
            case CanvasMode.Draw:
              dispatch([
                currentShapeId === EmptyDocumentNewShapeId
                  ? [ActionType.CreateShape]
                  : [ActionType.Continue],
                [ActionType.CreateSingularVector, position],
                [ActionType.AssignCurrentVectorToCurrentShape],
                [ActionType.AddToHistory],
              ]);
              break;
          }
        },
        onDrag: (
          position: Point,
          positionWhenStarted: Point,
          altKey: boolean
        ) => {
          switch (mode) {
            case CanvasMode.Move: {
              dispatch([
                [
                  ActionType.SetSelectionRectangle,
                  positionWhenStarted,
                  altKey,
                  position,
                ],
              ]);
              break;
            }
            case CanvasMode.TranslateShape:
            case CanvasMode.TranslateVector: {
              dispatch([
                [ActionType.MoveVector, altKey, positionWhenStarted, position],
              ]);
              break;
            }
            case CanvasMode.OnLoopSegment:
            case CanvasMode.OnVector: {
              dispatch([
                [
                  ActionType.SetVectorPositionMap,
                  buildVectorPositionMap(vectors, canvas.selection[1][0]),
                ],
                [ActionType.SwitchMode, CanvasMode.TranslateVector],
              ]);
              break;
            }
            case CanvasMode.DrawCubicVector:
              dispatch([[ActionType.MoveCubicVectorReflections, position]]);
              break;
            case CanvasMode.Draw:
              dispatch([
                currentShapeId === EmptyDocumentNewShapeId
                  ? [ActionType.CreateShape]
                  : [ActionType.Continue],
                [ActionType.CreateCubicVector, position],
                [ActionType.AssignCurrentVectorToCurrentShape],
                [ActionType.SwitchMode, CanvasMode.DrawCubicVector],
              ]);
              break;
          }
        },
        onDragEnd: () => {
          switch (mode) {
            case CanvasMode.Move: {
              dispatch([[ActionType.ClearSelectionRectangle]]);
              break;
            }
            case CanvasMode.TranslateShape:
              dispatch([
                [ActionType.SwitchMode, CanvasMode.Move],
                [ActionType.AddToHistory],
              ]);
              break;
            case CanvasMode.TranslateVector:
              dispatch([
                [ActionType.SwitchMode, CanvasMode.Draw],
                [ActionType.AddToHistory],
              ]);
              break;
            case CanvasMode.DrawCubicVector:
              dispatch([
                [ActionType.SwitchMode, CanvasMode.Draw],
                [ActionType.AddToHistory],
              ]);
              break;
          }
        },
        onDoubleClick: (position: Point) => {
          switch (mode) {
            case CanvasMode.Move:
              const shapeIds = canvas.selection[1][1];
              const shapeId = shapeIds.find((shapeId) => {
                const shape = getShapeById(shapes, shapeId);
                const boundingBox = boundingBoxFromPoints(
                  shape[1].map(
                    (vectorId) => getVectorById(vectors, vectorId).position
                  )
                );
                return isPointInBoundingBox(position, boundingBox);
              });
              dispatch(
                shapeId
                  ? [
                      [ActionType.SetCurrentShapeId, shapeId],
                      [ActionType.SwitchMode, CanvasMode.Draw],
                    ]
                  : [[ActionType.SwitchMode, CanvasMode.Draw]]
              );
              break;
          }
        },
      }),
    ];
  }, [
    canvas,
    currentShapeId,
    mode,
    shapes,
    vectors,
    canvasContentBoundingBoxes,
    pointsCanvasContent,
    selectionRectangleCanvasContent,
  ]);
  return (
    <div className="Container">
      <div className={"Header"}>
        <div id="Logo"></div>
        <h1>Sketchbook</h1>
      </div>
      <ColorPickers
        documentColors={[
          ...shapes.reduce((prev, shape) => {
            const [fill, stroke] = shape[2];
            prev.add(toHex(fill));
            prev.add(toHex(stroke));
            return prev;
          }, new Set<string>(["#ffffff00", "#000000ff"])),
        ].map((hex) => parseHex(hex))}
        style={canvas.style}
        onStyleChange={(style) => {
          dispatch([[ActionType.SetStyle, style], [ActionType.AddToHistory]]);
        }}
      />
      <div className="Canvas">
        {canvasElements.map((canvasElement) => (
          <HtmlCanvas
            paths={canvasElement.content}
            key={canvasElement.htmlId}
            onDrag={canvasElement.onDrag}
            onMove={canvasElement.onMouseMove}
            onDragEnd={canvasElement.onDragEnd}
            onClick={canvasElement.onClick}
            onDoubleClick={canvasElement.onDoubleClick}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
