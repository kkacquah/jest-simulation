const execa = require('execa');

interface JestSimulationOptions {
  args?: string[];
  [key: string]: any;
}

export async function runJestSimulation(testFile: string, options: JestSimulationOptions = {}) {
  console.log(`Running jest simulation for test file: ${testFile}`);
  const jestBin = require.resolve('jest/bin/jest');
  const { args = [], ...execaOptions } = options;
  
  const result = await execa(
    'node',
    [jestBin, testFile, '--no-color', ...args],
    {
      reject: false,
      stdio: 'inherit', 
      ...execaOptions,
    }
  );

  return result;
}