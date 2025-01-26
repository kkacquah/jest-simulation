import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  reporters: [
    ['<rootDir>/dist/reporter/SimulationReporter.js', {}]
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest/setup.ts'
  ]
};

export default config;
