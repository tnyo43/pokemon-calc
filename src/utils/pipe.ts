// https://qiita.com/nagtkk/items/5c54ec418c1c71fa491a
export type Pipe<T> = {
  (): T;
  <U>(f: (x: T) => U): Pipe<U>;
};

export const pipe: <T>(x: T) => Pipe<T> = <T>(x: T) =>
  (<U>(f?: (x: T) => U) => (f ? pipe(f(x)) : x)) as Pipe<T>;
