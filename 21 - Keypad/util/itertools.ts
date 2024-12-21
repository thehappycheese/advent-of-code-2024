
export type LoopyType<T = unknown> = IterableIterator<T> | Iterable<T>

export function* pairwise<T>(items: LoopyType<T>): Generator<[T, T]> {
    let last;
    let first = true;
    for (const item of items) {
        if (first) {
            first = false;
            last = item;
            continue;
        }
        yield [last!, item];
        last = item;
    }
}
export function* repeat_first<T>(items: LoopyType<T>): Generator<T> {
    let first = undefined;
    for (const item of items) {
        first = first ?? item;
        yield item;
    }
    if (first) yield first;
}
export const pair_loop = <T,>(items: LoopyType<T>) => pairwise(repeat_first(items));

export function* zip<T, U>(iterable1: LoopyType<T>, iterable2: LoopyType<U>): Generator<[T, U]> {
    const iterator1 = iterable1[Symbol.iterator]();
    const iterator2 = iterable2[Symbol.iterator]();
  
    while (true) {
      const result1 = iterator1.next();
      const result2 = iterator2.next();
  
      if (result1.done || result2.done) {
        return;
      }
  
      yield [result1.value, result2.value];
    }
  }