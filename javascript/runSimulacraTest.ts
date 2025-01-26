import { resolve } from "path";

const execa = require('execa');

interface JestSimulationOptions {
  args?: string[];
  [key: string]: any;
}

export async function runJestSimulation(testFile: string, options: JestSimulationOptions = {}) {
  const jestBin = resolve(__dirname, 'node_modules/jest/bin/jest');
  const configPath = resolve(__dirname, 'jest.simulacra.config.ts');
  const { args = [], ...execaOptions } = options;
  
  const result = await execa(
    'node',
    [jestBin, testFile, '--no-color', '-c', configPath, ...args],
    {
      reject: false,
      stdio: 'inherit', 
      ...execaOptions,
    }
  );

  return result;
}