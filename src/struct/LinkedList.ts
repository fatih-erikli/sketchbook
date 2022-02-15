import { LinkedList, LinkedListNode, Predicate } from "../types/LinkedList";

export const replace = <T>(
  linkedList: LinkedList<T>,
  self: LinkedListNode<T>,
  other: LinkedListNode<T>
) => {
  if (!self.parent) linkedList.root = other;
  else if (self === self.parent.left) self.parent.left = other;
  else self.parent.right = other;
  if (other) other.parent = self.parent;
};

export const minNode = <T>(
  linkedList: LinkedList<T>,
  node?: LinkedListNode<T>
) => {
  let root = node || linkedList.root;
  if (root) while (root.left) root = root.left;
  return root;
};

export const maxNode = <T>(
  linkedList: LinkedList<T>,
  node?: LinkedListNode<T>
) => {
  let root = node || linkedList.root;
  if (root) while (root.right) root = root.right;
  return root;
};

export const insert = <T>(
  linkedList: LinkedList<T>,
  key: T,
  compare: Predicate<T>
): LinkedListNode<T> => {
  let root = linkedList.root;
  let node = null;
  while (root) {
    node = root;
    if (compare(root.key, key) < 0) root = root.right;
    else root = root.left;
  }
  root = { key, left: null, right: null, parent: node };
  if (!node) linkedList.root = root;
  else if (compare(node.key, root.key) < 0) node.right = root;
  else node.left = root;
  return root;
};

export const find = <T>(
  linkedList: LinkedList<T>,
  key: T,
  compare: Predicate<T>
) => {
  let root = linkedList.root;
  while (root) {
    var cmp = compare(root.key, key);
    if (cmp < 0) root = root.right;
    else if (cmp > 0) root = root.left;
    else return root;
  }
  return null;
};

export const removeNode = <T>(
  linkedList: LinkedList<T>,
  key: T,
  compare: Predicate<T>
) => {
  var node = find(linkedList, key, compare);
  if (!node) return false;
  if (!node.left) replace(linkedList, node, node.right!);
  else if (!node.right) replace(linkedList, node, node.left);
  else {
    var y = minNode(linkedList, node.right)!;
    if (y.parent !== node) {
      replace(linkedList, y, y.right!);
      y.right = node.right;
      y.right.parent = y;
    }
    replace(linkedList, node, y);
    y.left = node.left;
    y.left.parent = y;
  }
  return true;
};

export const nextNode = (node: any) => {
  var successor = node;
  if (successor) {
    if (successor.right) {
      successor = successor.right;
      while (successor && successor.left) successor = successor.left;
    } else {
      successor = node.parent;
      while (successor && successor.right === node) {
        node = successor;
        successor = successor.parent;
      }
    }
  }
  return successor;
};

export const previousNode = (node: any) => {
  let predecessor = node;
  if (predecessor) {
    if (predecessor.left) {
      predecessor = predecessor.left;
      while (predecessor && predecessor.right) predecessor = predecessor.right;
    } else {
      predecessor = node!.parent;
      while (predecessor && predecessor.left === node) {
        node = predecessor;
        predecessor = predecessor.parent;
      }
    }
  }
  return predecessor;
};
