export const sliceByNumber = <T>(arr: Array<T>, size: number) =>
  arr.flatMap((_, i, a) => i % size ? [] : [a.slice(i, i + size)]);
