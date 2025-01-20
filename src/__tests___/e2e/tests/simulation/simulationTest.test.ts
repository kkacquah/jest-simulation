import { runJestSimulation } from '../../runJestSimulation';
import path from 'path';

describe('Simulation Tests', () => {
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
