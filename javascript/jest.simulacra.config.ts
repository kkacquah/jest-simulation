import type { Config } from '@jest/types';


/**
 * The jest config that tests against our current jest config uses.
 */
const config: Config.InitialOptions = {
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
  ],

};

export default config;
