// Typescript implementation of Martinez polygon clipping algorithm
// https://github.com/w8r/martinez
import { pop, push } from "../struct/HeapQueue";
import {
  insert,
  minNode,
  previousNode,
  nextNode,
  find,
  removeNode,
} from "../struct/LinkedList";
import { HeapQueue } from "../types/HeapQueue";
import { Point } from "../types/Point";
import { Contour, SweepEvent } from "../types/SweepEvent";

const NORMAL = 0;
const NON_CONTRIBUTING = 1;
const SAME_TRANSITION = 2;
const DIFFERENT_TRANSITION = 3;

const INTERSECTION = 0;
const UNION = 1;
const DIFFERENCE = 2;
const XOR = 3;

const signedArea = (a: Point, b: Point, c: Point) =>
  (a[1] - c[1]) * (b[0] - c[0]) - (a[0] - c[0]) * (b[1] - c[1]);

const sweepEventDefaults: SweepEvent = {
  left: false,
  point: [-1, -1],
  otherEvent: null,
  isSubject: false,
  type: NORMAL,
  inOut: false,
  otherInOut: false,
  prevInResult: null,
  resultTransition: 0,
  otherPos: -1,
  outputContourId: -1,
  contourId: 0,
};

export const isVertical = (sweepEvent: SweepEvent) => {
  return sweepEvent.point[0] === sweepEvent.otherEvent!.point[0];
};

export const isBelow = (sweepEvent: SweepEvent, point: Point) => {
  const p0 = sweepEvent.point,
    p1 = sweepEvent.otherEvent!.point;
  return sweepEvent.left
    ? (p0[0] - point[0]) * (p1[1] - point[1]) -
        (p1[0] - point[0]) * (p0[1] - point[1]) >
        0
    : (p1[0] - point[0]) * (p0[1] - point[1]) -
        (p0[0] - point[0]) * (p1[1] - point[1]) >
        0;
};

function subdivide(eventQueue: HeapQueue<SweepEvent>, operation: number) {
  const sweepLine = {
    size: 0,
    root: null,
  };
  const sortedEvents = [];
  let prev, next, begin;

  while (eventQueue.size !== 0) {
    let event = pop(eventQueue, compareEvents) as SweepEvent;
    sortedEvents.push(event);

    if (event.left) {
      next = prev = insert(sweepLine, event, compareSegments);
      begin = minNode(sweepLine);

      if (prev !== begin) prev = previousNode(prev);
      else prev = null;

      next = nextNode(next);

      const prevEvent = prev ? prev.key : null;
      let prevprevEvent;
      computeFields(event, prevEvent, operation);
      if (next) {
        if (possibleIntersection(event, next.key, eventQueue) === 2) {
          computeFields(event, prevEvent, operation);
          computeFields(event, next.key, operation);
        }
      }

      if (prev) {
        if (possibleIntersection(prev.key, event, eventQueue) === 2) {
          let prevprev = prev;
          if (prevprev !== begin) prevprev = previousNode(prevprev);
          else prevprev = null;

          prevprevEvent = prevprev ? prevprev.key : null;
          computeFields(prevEvent, prevprevEvent, operation);
          computeFields(event, prevEvent, operation);
        }
      }
    } else {
      event = event.otherEvent!;
      next = prev = find(sweepLine, event, compareSegments);

      if (prev && next) {
        if (prev !== begin) prev = previousNode(prev);
        else prev = null;

        next = nextNode(next);
        removeNode(sweepLine, event, compareSegments);

        if (next && prev) {
          possibleIntersection(prev.key, next.key, eventQueue);
        }
      }
    }
  }
  return sortedEvents;
}

function compareSegments(le1: SweepEvent, le2: SweepEvent) {
  if (le1 === le2) return 0;

  if (
    signedArea(le1.point, le1.otherEvent!.point, le2.point) !== 0 ||
    signedArea(le1.point, le1.otherEvent!.point, le2.otherEvent!.point) !== 0
  ) {
    if (equals(le1.point, le2.point))
      return isBelow(le1, le2.otherEvent!.point) ? -1 : 1;
    if (le1.point[0] === le2.point[0])
      return le1.point[1] < le2.point[1] ? -1 : 1;
    if (compareEvents(le1, le2) === 1) {
      return !isBelow(le2, le1.point) ? -1 : 1;
    }
    return isBelow(le1, le2.point) ? -1 : 1;
  }

  if (le1.isSubject === le2.isSubject) {
    let p1 = le1.point,
      p2 = le2.point;
    if (equals(p1, p2)) {
      p1 = le1.otherEvent!.point;
      p2 = le2.otherEvent!.point;
      if (equals(p1, p2)) return 0;
      else return le1.contourId > le2.contourId ? 1 : -1;
    }
  } else {
    return le1.isSubject ? -1 : 1;
  }

  return compareEvents(le1, le2) === 1 ? 1 : -1;
}

function equals(p1: Point, p2: Point) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function compareEvents(e1: SweepEvent, e2: SweepEvent) {
  const p1 = e1.point;
  const p2 = e2.point;
  if (p1[0] > p2[0]) return 1;
  if (p1[0] < p2[0]) return -1;
  if (p1[1] !== p2[1]) return p1[1] > p2[1] ? 1 : -1;

  return specialCases(e1, e2, p1, p2);
}

function specialCases(e1: SweepEvent, e2: SweepEvent, p1: Point, p2: Point) {
  if (e1.left !== e2.left) return e1.left ? 1 : -1;
  if (signedArea(p1, e1.otherEvent!.point, e2.otherEvent!.point) !== 0) {
    return !isBelow(e1, e2.otherEvent!.point) ? 1 : -1;
  }
  return !e1.isSubject && e2.isSubject ? 1 : -1;
}

function computeFields(
  event: SweepEvent,
  prev: SweepEvent | null,
  operation: number
) {
  if (prev === null) {
    event.inOut = false;
    event.otherInOut = true;
  } else {
    if (event.isSubject === prev.isSubject) {
      event.inOut = !prev.inOut;
      event.otherInOut = prev.otherInOut;
    } else {
      event.inOut = !prev.otherInOut;
      event.otherInOut = isVertical(prev) ? !prev.inOut : prev.inOut;
    }
    if (prev) {
      event.prevInResult =
        !inResult(prev, operation) || isVertical(prev)
          ? prev.prevInResult
          : prev;
    }
  }
  let isInResult = inResult(event, operation);
  if (isInResult) {
    event.resultTransition = determineResultTransition(event, operation);
  } else {
    event.resultTransition = 0;
  }
}

function inResult(event: SweepEvent, operation: number) {
  switch (event.type) {
    case NORMAL:
      switch (operation) {
        case INTERSECTION:
          return !event.otherInOut;
        case UNION:
          return event.otherInOut;
        case DIFFERENCE:
          return (
            (event.isSubject && event.otherInOut) ||
            (!event.isSubject && !event.otherInOut)
          );
        case XOR:
          return true;
      }
      break;
    case SAME_TRANSITION:
      return operation === INTERSECTION || operation === UNION;
    case DIFFERENT_TRANSITION:
      return operation === DIFFERENCE;
    case NON_CONTRIBUTING:
      return false;
  }
  return false;
}

function determineResultTransition(event: SweepEvent, operation: number) {
  let thisIn = !event.inOut;
  let thatIn = !event.otherInOut;
  let isIn;
  switch (operation) {
    case INTERSECTION:
      isIn = thisIn && thatIn;
      break;
    case UNION:
      isIn = thisIn || thatIn;
      break;
    case XOR:
      isIn = thisIn !== thatIn;
      break;
    case DIFFERENCE:
      if (event.isSubject) {
        isIn = thisIn && !thatIn;
      } else {
        isIn = thatIn && !thisIn;
      }
      break;
  }
  return isIn ? 1 : -1;
}

function orderEvents(sortedEvents: SweepEvent[]) {
  let event, i, len, tmp;
  const resultEvents = [];
  for (const event of sortedEvents) {
    if (
      (event.left && event.resultTransition !== 0) ||
      (!event.left && event.otherEvent!.resultTransition !== 0)
    ) {
      resultEvents.push(event);
    }
  }

  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (i = 0, len = resultEvents.length; i < len; i++) {
      if (
        i + 1 < len &&
        compareEvents(resultEvents[i], resultEvents[i + 1]) === 1
      ) {
        tmp = resultEvents[i];
        resultEvents[i] = resultEvents[i + 1];
        resultEvents[i + 1] = tmp;
        sorted = false;
      }
    }
  }
  for (i = 0, len = resultEvents.length; i < len; i++) {
    event = resultEvents[i];
    event.otherPos = i;
  }
  for (const event of resultEvents) {
    if (!event.left) {
      tmp = event.otherPos;
      event.otherPos = event.otherEvent!.otherPos;
      event.otherEvent!.otherPos = tmp;
    }
  }
  return resultEvents;
}

function nextPos(
  pos: number,
  resultEvents: SweepEvent[],
  processed: Record<number, boolean>,
  origPos: number
) {
  let newPos = pos + 1,
    p = resultEvents[pos].point,
    p1 = [-1, -1];
  const length = resultEvents.length;
  if (newPos < length) p1 = resultEvents[newPos].point;
  while (newPos < length && p1[0] === p[0] && p1[1] === p[1]) {
    if (!processed[newPos]) {
      return newPos;
    } else {
      newPos++;
    }
    p1 = resultEvents[newPos].point;
  }
  newPos = pos - 1;
  while (processed[newPos] && newPos > origPos) {
    newPos--;
  }
  return newPos;
}

function initializeContourFromContext(
  event: SweepEvent,
  contours: Contour[],
  contourId: number
) {
  const contour: Contour = {
    points: [],
    holeIds: [],
    holeOf: null,
    depth: null,
  };
  if (event.prevInResult != null) {
    const prevInResult = event.prevInResult;
    const lowerContourId = prevInResult.outputContourId;
    const lowerResultTransition = prevInResult.resultTransition;
    if (lowerResultTransition > 0) {
      const lowerContour = contours[lowerContourId];
      if (lowerContour.holeOf != null) {
        const parentContourId = lowerContour.holeOf;
        contours[parentContourId].holeIds.push(contourId);
        contour.holeOf = parentContourId;
        contour.depth = contours[lowerContourId].depth;
      } else {
        contours[lowerContourId].holeIds.push(contourId);
        contour.holeOf = lowerContourId;
        contour.depth = (contours[lowerContourId].depth || -1) + 1;
      }
    } else {
      contour.holeOf = null;
      contour.depth = contours[lowerContourId].depth;
    }
  } else {
    contour.holeOf = null;
    contour.depth = 0;
  }
  return contour;
}

function connectEdges(sortedEvents: SweepEvent[]) {
  let i, len;
  const resultEvents = orderEvents(sortedEvents);
  const processed: Record<number, boolean> = {};
  const contours = [];

  for (i = 0, len = resultEvents.length; i < len; i++) {
    if (processed[i]) {
      continue;
    }
    const contourId = contours.length;
    const contour = initializeContourFromContext(
      resultEvents[i],
      contours,
      contourId
    );
    const markAsProcessed = (pos: number) => {
      processed[pos] = true;
      resultEvents[pos].outputContourId = contourId;
    };
    let pos = i;
    let origPos = i;
    const initial = resultEvents[i].point;
    contour.points.push(initial);
    while (true) {
      markAsProcessed(pos);
      pos = resultEvents[pos].otherPos;
      markAsProcessed(pos);
      contour.points.push(resultEvents[pos].point);
      pos = nextPos(pos, resultEvents, processed, origPos);
      if (pos === origPos) {
        break;
      }
    }
    contours.push(contour);
  }

  return contours;
}

function divideSegment(se: SweepEvent, p: Point, queue: HeapQueue<SweepEvent>) {
  const r: SweepEvent = {
    ...sweepEventDefaults,
    point: p,
    left: false,
    isSubject: se.isSubject,
    otherEvent: se,
  };
  const l: SweepEvent = {
    ...sweepEventDefaults,
    left: true,
    point: p,
    isSubject: se.isSubject,
    otherEvent: se.otherEvent,
  };

  r.contourId = l.contourId = se.contourId;
  if (compareEvents(l, se.otherEvent!) > 0) {
    se.otherEvent!.left = true;
    l.left = false;
  }

  se.otherEvent!.otherEvent = l;
  se.otherEvent = r;

  push(queue, l, compareEvents);
  push(queue, r, compareEvents);

  return queue;
}

let contourId = 0;

function processPolygon(
  contourOrHole: Point[],
  isSubject: boolean,
  depth: number,
  Q: HeapQueue<SweepEvent>
) {
  let i, len, s1, s2, e1, e2;
  for (i = 0, len = contourOrHole.length - 1; i < len; i++) {
    s1 = contourOrHole[i];
    s2 = contourOrHole[i + 1];
    e1 = {
      ...sweepEventDefaults,
      point: s1,
      left: false,
      isSubject,
    };
    e2 = {
      ...sweepEventDefaults,
      point: s2,
      left: false,
      isSubject,
      otherEvent: e1,
    };
    e1.otherEvent = e2;

    if (equals(s1, s2)) {
      continue;
    }

    e1.contourId = e2.contourId = depth;

    (compareEvents(e1, e2) > 0 ? e2 : e1).left = true;

    push(Q, e1, compareEvents);
    push(Q, e2, compareEvents);
  }
}

function fillQueue(subject: Point[], clipping: Point[]): HeapQueue<SweepEvent> {
  const eventQueue: HeapQueue<SweepEvent> = { size: 0, heap: [] };
  contourId++;
  processPolygon(subject, true, contourId, eventQueue);
  contourId++;
  processPolygon(clipping, false, contourId, eventQueue);
  return eventQueue;
}

export function boolean(
  subject: Point[],
  clipping: Point[],
  operation: number
) {
  const eventQueue = fillQueue(subject, clipping);
  const sortedEvents = subdivide(eventQueue, operation);
  const contours = connectEdges(sortedEvents);
  let polygons: any[] = [];
  for (const contour of contours) {
    if (contour.holeOf == null) {
      let rings = [contour.points];
      for (let j = 0; j < contour.holeIds.length; j++) {
        let holeId = contour.holeIds[j];
        rings.push(contours[holeId].points);
      }
      polygons = polygons.concat(rings);
    }
  }
  return polygons;
}

function possibleIntersection(
  se1: SweepEvent,
  se2: SweepEvent,
  queue: HeapQueue<SweepEvent>
) {
  const inter = intersection(
    se1.point,
    se1.otherEvent!.point,
    se2.point,
    se2.otherEvent!.point
  );

  if (!inter) {
    return 0;
  }

  const nintersections = inter.length;
  if (nintersections === 0) return 0;
  if (
    nintersections === 1 &&
    (equals(se1.point, se2.point) ||
      equals(se1.otherEvent!.point, se2.otherEvent!.point))
  ) {
    return 0;
  }

  if (nintersections === 2 && se1.isSubject === se2.isSubject) {
    return 0;
  }

  if (nintersections === 1) {
    if (
      !equals(se1.point, inter[0]) &&
      !equals(se1.otherEvent!.point, inter[0])
    ) {
      divideSegment(se1, inter[0], queue);
    }

    if (
      !equals(se2.point, inter[0]) &&
      !equals(se2.otherEvent!.point, inter[0])
    ) {
      divideSegment(se2, inter[0], queue);
    }
    return 1;
  }

  const events = [];
  let leftCoincide = false;
  let rightCoincide = false;

  if (equals(se1.point, se2.point)) {
    leftCoincide = true;
  } else if (compareEvents(se1, se2) === 1) {
    events.push(se2, se1);
  } else {
    events.push(se1, se2);
  }

  if (equals(se1.otherEvent!.point, se2.otherEvent!.point)) {
    rightCoincide = true;
  } else if (compareEvents(se1.otherEvent!, se2.otherEvent!) === 1) {
    events.push(se2.otherEvent, se1.otherEvent);
  } else {
    events.push(se1.otherEvent, se2.otherEvent);
  }

  if ((leftCoincide && rightCoincide) || leftCoincide) {
    se2.type = NON_CONTRIBUTING;
    se1.type = se2.inOut === se1.inOut ? SAME_TRANSITION : DIFFERENT_TRANSITION;

    if (leftCoincide && !rightCoincide) {
      divideSegment(events[1]!.otherEvent!, events[0]!.point, queue);
    }
    return 2;
  }
  if (rightCoincide) {
    divideSegment(events[0]!, events[1]!.point, queue);
    return 3;
  }
  if (events[0] !== events[3]!.otherEvent) {
    divideSegment(events[0]!, events[1]!.point, queue);
    divideSegment(events[1]!, events[2]!.point, queue);
    return 3;
  }
  divideSegment(events[0]!, events[1]!.point, queue);
  divideSegment(events[3]!.otherEvent!, events[2]!.point, queue);
  return 3;
}

function crossProduct(a: Point, b: Point) {
  return a[0] * b[1] - a[1] * b[0];
}

function dotProduct(a: Point, b: Point) {
  return a[0] * b[0] + a[1] * b[1];
}

function intersection(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
  noEndpointTouch: boolean = false
): Point[] | null {
  const va: Point = [a2[0] - a1[0], a2[1] - a1[1]];
  const vb: Point = [b2[0] - b1[0], b2[1] - b1[1]];
  function toPoint(p: Point, s: number, d: Point): Point {
    return [p[0] + s * d[0], p[1] + s * d[1]];
  }

  const e: Point = [b1[0] - a1[0], b1[1] - a1[1]];
  let kross = crossProduct(va, vb);
  let sqrKross = kross * kross;
  const sqrLenA = dotProduct(va, va);

  if (sqrKross > 0) {
    const s = crossProduct(e, vb) / kross;
    if (s < 0 || s > 1) {
      return null;
    }
    const t = crossProduct(e, va) / kross;
    if (t < 0 || t > 1) {
      return null;
    }
    if (s === 0 || s === 1) {
      return noEndpointTouch ? null : [toPoint(a1, s, va)];
    }
    if (t === 0 || t === 1) {
      return noEndpointTouch ? null : [toPoint(b1, t, vb)];
    }
    return [toPoint(a1, s, va)];
  }

  kross = crossProduct(e, va);
  sqrKross = kross * kross;

  if (sqrKross > 0) {
    return null;
  }

  const sa = dotProduct(va, e) / sqrLenA;
  const sb = sa + dotProduct(va, vb) / sqrLenA;
  const smin = Math.min(sa, sb);
  const smax = Math.max(sa, sb);
  if (smin <= 1 && smax >= 0) {
    if (smin === 1) {
      return noEndpointTouch ? null : [toPoint(a1, smin > 0 ? smin : 0, va)];
    }
    if (smax === 0) {
      return noEndpointTouch ? null : [toPoint(a1, smax < 1 ? smax : 1, va)];
    }
    if (noEndpointTouch && smin === 0 && smax === 1) return null;
    return [
      toPoint(a1, smin > 0 ? smin : 0, va),
      toPoint(a1, smax < 1 ? smax : 1, va),
    ];
  }
  return null;
}
