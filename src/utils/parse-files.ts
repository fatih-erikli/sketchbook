import { Shape } from "../types/Shape";

type ParsedDocument = {
  shapes: Shape[],
  size: [number, number]
}


export const parseFiles = (files: FileList): Promise<ParsedDocument[]> => {
  return new Promise((resolve) => {
    const promises: Promise<ParsedDocument>[] = [];
    for (const file of files) {
      const reader = new FileReader();
      promises.push(
        new Promise((resolve, reject) => {
          reader.onload = (event) => {
            if (!event.target || !event.target.result) {
              return;
            }
            const xmlStr = event.target.result as string;
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "application/xml");
            const errorNode = doc.querySelector("parsererror");
            if (errorNode || !doc) {
              reject(
                "Upload a file which is parsable by DOMParser (svg, xml, or html)."
              );
            } else {
              const viewBox = (doc.firstElementChild as SVGSVGElement).viewBox;
              const newShapes: Shape[] = [];
              for (const path of doc.querySelectorAll("path")) {
                // const shape = Shape.fromPathSegList((path as any).pathSegList);
                // const shape = {};
                // newShapes.push(shape);
              }
              resolve({
                shapes: newShapes,
                size: [viewBox.baseVal ? viewBox.baseVal.width: 200, viewBox.baseVal ? viewBox.baseVal.height: 200],
              });
            }
          };
        })
      );
      reader.readAsText(file);
    }
    Promise.allSettled(promises).then((promises) => {
      resolve(
        promises
          .filter((promise) => (promise.status = "fulfilled"))
          .map(
            (promise) =>
              (promise as PromiseFulfilledResult<ParsedDocument>).value
          )
      );
    });
  });
};
