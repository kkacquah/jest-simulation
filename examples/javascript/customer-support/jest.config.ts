import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 100000,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "<rootDir>/node_modules/simulacra-js/dist/jest/setup.js"],
  reporters: [],
};

export default config;
