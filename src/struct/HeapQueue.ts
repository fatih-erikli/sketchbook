import { HeapQueue } from "../types/HeapQueue";
import { Predicate } from "../types/LinkedList";

export const push = <T>(
  queue: HeapQueue<T>,
  value: T,
  predicate: Predicate<T>
) => {
  queue.heap.push(value);
  queue.size += 1;
  lift(queue, queue.size - 1, predicate);
};

export const pop = <T>(
  queue: HeapQueue<T>,
  predicate: Predicate<T>
): T | undefined => {
  if (queue.size === 0) {
    return;
  }
  
  var top = queue.heap[0];
  queue.size--;

  if (queue.size > 0) {
    queue.heap[0] = queue.heap[queue.size];
    down(queue, 0, predicate);
  }
  queue.heap.pop();

  return top;
};

export const lift = <T>(
  queue: HeapQueue<T>,
  position: number,
  predicate: Predicate<T>
) => {
  var data = queue.heap;
  var item = data[position];

  while (position > 0) {
    var parent = (position - 1) >> 1;
    var current = data[parent];
    if (predicate(item, current) >= 0) break;
    data[position] = current;
    position = parent;
  }

  data[position] = item;
};

export const down = <T>(
  queue: HeapQueue<T>,
  position: number,
  predicate: Predicate<T>
) => {
  var data = queue.heap;
  var halfLength = queue.size >> 1;
  var item = data[position];

  while (position < halfLength) {
    var left = (position << 1) + 1;
    var right = left + 1;
    var best = data[left];

    if (right < queue.size && predicate(data[right], best) < 0) {
      left = right;
      best = data[right];
    }
    if (predicate(best, item) >= 0) break;

    data[position] = best;
    position = left;
  }

  data[position] = item;
};
