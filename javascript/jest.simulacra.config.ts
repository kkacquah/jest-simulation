import type { Config } from '@jest/types';


/**
 * The jest config used for tests of this testing library.
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
