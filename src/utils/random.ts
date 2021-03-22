// random utils

export const probability = (p: number) => Math.random() <= p;

export const range = (start: number, stop: number, step: number) =>
  Math.floor(Math.random() * ((stop - start) / step + 1)) * step + start;
