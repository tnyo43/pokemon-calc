import * as readline from "readline";

export const read = <T>(
  query: string,
  callback: (answer: string) => T
): Promise<T> => {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, _) => {
    reader.question(query, (answer) => {
      reader.close();
      resolve(callback(answer));
    });
  });
};

export const validIndex = (
  candidate: number[],
  answer: string
): number | null => {
  const index = Number(answer) - 1;
  return !isNaN(index) && candidate.some((i) => i === index) ? index : null;
};
