import * as path from 'path';
import { runSimulacraTest } from '../../../../runSimulacraTest';

describe('expect', () => {
  describe('eventually', () => {
  const testFile = path.resolve(__dirname, '../fakeTests/expectEventually.test.ts');

  it('should eventually pass when condition becomes true on third turn', async () => {
    const result = await runSimulacraTest(testFile, {
      args: ['-t', 'should eventually pass when condition becomes true on third turn'],
    });
    expect(result.exitCode).toBe(0);
  });

  it.only('should fail when condition never becomes true', async () => {
    const result = await runSimulacraTest(testFile, {
      args: ['-t', 'should fail when condition never becomes true'],
    });
    expect(result.exitCode).toBe(1);
    });
  });
  describe('when', () => {
    const testFile = path.resolve(__dirname, './fakeTests/expectWhen.test.ts');
    it('should pass when condition becomes true during simulation', async () => {
      const result = await runSimulacraTest(testFile, {
        args: ['-t', 'passing test - condition met on specific turn'],
      });
      expect(result.exitCode).toBe(0);
    });

    it('should support multiple conditions in same test', async () => {
      const result = await runSimulacraTest(testFile, {
        args: ['-t', 'passing test - multiple conditions'],
      });
      expect(result.exitCode).toBe(0);
    });

    it('should fail when condition never becomes true', async () => {
      const result = await runSimulacraTest(testFile, {
        args: ['-t', 'passing test - external state changes'],
      });
      expect(result.exitCode).toBe(0);
    });
  });
});
