import { LoopyType } from "../16-01-typescript.ts";

function* pairwise<T>(items: LoopyType<T>): Generator<[T, T]> {
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
function* repeat_first<T>(items: LoopyType<T>): Generator<T> {
  let first = undefined;
  for (const item of items) {
    first = first ?? item;
    yield item;
  }
  if (first) yield first;
}
export const pair_loop = <T,>(items: LoopyType<T>) => pairwise(repeat_first(items));
