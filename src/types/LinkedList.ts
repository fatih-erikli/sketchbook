export type LinkedListNode<T> = {
  key: T;
  left: LinkedListNode<T> | null;
  right: LinkedListNode<T> | null;
  parent: LinkedListNode<T> | null;
};

export type LinkedList<T> = {
  root: LinkedListNode<T> | null;
}

export type Predicate<T> = (a: T, b: T) => -1 | 0 | 1;
