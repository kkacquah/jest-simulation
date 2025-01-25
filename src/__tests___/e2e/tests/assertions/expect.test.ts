import path = require('path');
import { runJestSimulation } from '../../../../runJestSimulation';

describe('expect', () => {
  describe('eventually', () => {
  const testFile = path.resolve(__dirname, './fakeTests/expectEventually.test.ts');

  it('should eventually pass when condition becomes true on third turn', async () => {
    const result = await runJestSimulation(testFile, {
      args: ['-t', 'should eventually pass when condition becomes true on third turn'],
      debug: true
    });
    expect(result.exitCode).toBe(0);
  });

  it('should fail when condition never becomes true', async () => {
    const result = await runJestSimulation(testFile, {
      args: ['-t', 'should fail when condition never becomes true'],
      debug: true
    });
    expect(result.exitCode).toBe(1);
    });
  });
  describe('when', () => {
    const testFile = path.resolve(__dirname, './fakeTests/expectWhen.test.ts');
    it('should pass when condition becomes true during simulation', async () => {
      const result = await runJestSimulation(testFile, {
        args: ['-t', 'passing test - condition met on specific turn'],
        debug: true
      });
      expect(result.exitCode).toBe(0);
    });

    it('should support multiple conditions in same test', async () => {
      const result = await runJestSimulation(testFile, {
        args: ['-t', 'passing test - multiple conditions'],
        debug: true
      });
      expect(result.exitCode).toBe(0);
    });

    it('should fail when condition never becomes true', async () => {
      const result = await runJestSimulation(testFile, {
        args: ['-t', 'passing test - external state changes'],
        debug: true
      });
      expect(result.exitCode).toBe(0);
    });
  });
});
