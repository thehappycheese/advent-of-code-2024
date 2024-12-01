export const split_array = function* <T>(arr: T[], splitter: (item: T) => boolean): Generator<T[]> {
  let temp: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (splitter(item)) {
      yield temp;
      temp = [];
    } else {
      temp.push(item);
    }
  }
  yield temp;
};
