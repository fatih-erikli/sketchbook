// import { FC, ReactNode, useEffect, useRef, useState } from "react";
// import { parseFiles } from "../utils/parse-files";

// type ParsedDocument = {
//   shapes: Shape[],
//   size: [number, number]
// }

// const SvgElement: FC<{
//   onChange: (event: any) => void;
//   children: ReactNode;
//   onDropShapes: (shapes: Shape[]) => void;
// }> = ({ onChange, children, onDropShapes }) => {
//   const [width, setWidth] = useState<number | string>("100%");
//   const [height, setHeight] = useState<number | string>("100%");

//   useEffect(() => {
//     if (ref.current) {
//       const computedStyle = ref.current.parentElement!.getBoundingClientRect();
//       if ("safari" in window) {
//         setHeight(computedStyle.height);
//         setWidth(computedStyle.width);
//       }
//     }
//   }, []);

//   const ref = useRef<SVGSVGElement>(null);
//   const cursorWhenPressed = useRef<Vector>(Vector.Invisible());
//   const isDragEndFired = useRef<boolean>(true);
//   return (
//     <svg
//       ref={ref}
//       onDrop={(event) => {
//         event.preventDefault();
//         if (ref.current) {
//           const position = Vector.fromEvent(event, ref.current);
//           parseFiles(event.dataTransfer.files).then(
//             (parsedDocuments: ParsedDocument[]) => {
//               const translatedShapes: Shape[] = [];
//               parsedDocuments.forEach((parsedDocument) => {
//                 for (const shape of parsedDocument.shapes) {
//                   const cloned = shape.clone();
//                   cloned.translate(
//                     position.subtract(
//                       new Vector(
//                         parsedDocument.size[0] / 2,
//                         parsedDocument.size[1] / 2
//                       )
//                     ),
//                     new Vector(0, 0)
//                   );
//                   translatedShapes.push(cloned);
//                 }
//               });
//               onDropShapes(translatedShapes);
//             }
//           );
//         }
//       }}
//       onDragOver={(event) => {
//         event.preventDefault();
//       }}
//       onMouseDown={(event) => {
//         if (!ref.current) {
//           return;
//         }

//         cursorWhenPressed.current = Vector.fromEvent(event, ref.current);
//       }}
//       onMouseMove={(event) => {
//         if (!ref.current) {
//           return;
//         }

//         const currentCursorPosition = Vector.fromEvent(event, ref.current);
//         const distance = currentCursorPosition.distance(
//           cursorWhenPressed.current
//         );

//         if (
//           isDragEndFired.current === false ||
//           (event.buttons === 1 && distance > 1)
//         ) {
//           if (isDragEndFired.current === true) {
//             isDragEndFired.current = false;
//           }
//           onChange({
//             name: "on-drag",
//             initialCursorPosition: cursorWhenPressed.current,
//             currentCursorPosition: Vector.fromEvent(event, ref.current),
//           });
//         } else {
//           onChange({
//             name: "on-mouse-move",
//             currentCursorPosition,
//             initialCursorPosition: Vector.Invisible(),
//           });
//         }
//       }}
//       onMouseUp={(event) => {
//         if (!ref.current) {
//           return;
//         }

//         const currentCursorPosition = Vector.fromEvent(event, ref.current);
//         const distance = currentCursorPosition.distance(
//           cursorWhenPressed.current
//         );

//         onChange({
//           name: isDragEndFired.current ? "on-click" : "on-drag-end",
//           initialCursorPosition: Vector.Invisible(),
//           currentCursorPosition,
//         });

//         if (!isDragEndFired.current) {
//           isDragEndFired.current = true;
//         }

//         if (cursorWhenPressed.current) {
//           cursorWhenPressed.current = Vector.Invisible();
//         }
//       }}
//       className="Svg-Canvas"
//       id="canvas-area"
//       width={width}
//       height={height}
//     >
//       <g id="viewport">{children}</g>
//     </svg>
//   );
// };

// export default SvgElement;

export {}