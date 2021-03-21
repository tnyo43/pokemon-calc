import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  preset: "ts-jest",
  moduleDirectories: ["node_modules", "src", "__tests__"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "__tests__/(.*)": "<rootDir>/__tests__/$1",
  },
  testPathIgnorePatterns: ["__tests__/mock", "build"],
};
export default config;
