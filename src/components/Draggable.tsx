// import classNames from "classnames";
// import { FC, ReactNode, useEffect, useRef, useState } from "react";
// import { Vector } from "../classes/Vector";

// const Draggable: FC<{
//   children: ReactNode;
//   onDrop: (position: Vector) => void;
// }> = ({ children, onDrop }) => {
//   const draggedElement = useRef<HTMLDivElement>(null);
//   const [draggedElementPosition, setDraggedElementPosition] = useState<Vector>(
//     Vector.Invisible()
//   );
//   const draggedElementSize = (htmlElement: any) => {
//     if (htmlElement) {
//       const boundingBox = htmlElement.getBoundingClientRect();
//       return new Vector(boundingBox.width / 2, boundingBox.height / 2);
//     }
//     return Vector.Invisible();
//   };
//   const startDrag = (event: any) => {
//     setDraggedElementPosition(
//       Vector.fromEvent(event).subtract(draggedElementSize(event.target))
//     );
//   };
//   useEffect(() => {
//     const onMouseMove = (event: any) => {
//       if (!draggedElementPosition.isInvisible()) {
//         console.log(event.target);
//         setDraggedElementPosition(
//           Vector.fromEvent(event).subtract(draggedElementSize(draggedElement.current))
//         );
//       }
//     };
//     const onMouseUp = (event: any) => {
//       if (!draggedElementPosition.isInvisible()) {
//         setDraggedElementPosition(Vector.Invisible());
//         onDrop(Vector.fromEvent(event));
//       }
//     };
//     document.body.addEventListener("mousemove", onMouseMove);
//     document.body.addEventListener("mouseup", onMouseUp);
//     return () => {
//       document.body.removeEventListener("mousemove", onMouseMove);
//       document.body.removeEventListener("mouseup", onMouseUp);
//     };
//   }, [draggedElementPosition.isInvisible()]);
//   return (
//     <div onMouseDown={startDrag}>
//       <div
//         ref={draggedElement}
//         style={{
//           top: draggedElementPosition.y,
//           left: draggedElementPosition.x,
//         }}
//         className={classNames({
//           Hidden: draggedElementPosition.isInvisible(),
//           AbsolutePosition: true,
//         })}
//       >
//         {children}
//       </div>
//       {children}
//     </div>
//   );
// };

// export default Draggable;

export {}
