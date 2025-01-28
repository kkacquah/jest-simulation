const execa = require('execa');
import { resolve } from 'path';

interface JestSimulationOptions {
  args?: string[];
  // Debug mode, allows you to see output of runSimulacraTest.
  debug?: boolean;
}

export async function runSimulacraTest(testFile: string, options: JestSimulationOptions = {}) {
  const jestBin = resolve(__dirname, 'node_modules/jest/bin/jest');
  const configPath = resolve(__dirname, 'jest.simulacra.config.ts');
  const { args = [], debug = false, ...execaOptions } = options;
  
  const result = await execa(
    'node',
    [jestBin, testFile, '--no-color', '-c', configPath, ...args],
    {
      reject: false,
      stdio: ['inherit', 'pipe', 'inherit'], // Inherit stdin and stderr, but pipe stdout
      ...execaOptions,
    }
  );

  if (debug && result.stdout) {
    console.log(result.stdout);
  }

  return result;
}