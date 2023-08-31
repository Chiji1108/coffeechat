export function getRandom<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export function getDifference<T>(setA: Set<T>, setB: Set<T>) {
  return new Set<T>(
    [...setA].filter((element) => !setB.has(element)),
  );
}

export function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
