import { simulationExpect } from '../../../../../assertions/expect';
import { simulationTest } from '../../../../../simulation/simulationTest';

describe('expectEventually', () => {
  describe('should eventually pass when condition becomes true on third turn', () => {
    let isThirdTurnPassed = false;

    const inputFn = (turn: number) => {
      if (turn === 2) { // Third turn (0-based index)
        isThirdTurnPassed = true;
      }
      return { role: 'user', content: `Message for turn ${turn}` };
    };

    simulationTest(
      'passing test',
      {
        role: 'test',
        task: 'test content',
        inputFn,
      },
      async ({ agent }) => {
        console.log('test is running.');
        simulationExpect(agent.events, async () => {
          expect(isThirdTurnPassed).toBe(true);
        }).eventually();
      }
    );
  });

  describe('should fail when condition never becomes true', () => {
    let isThirdTurnPassed = false; // This will never be set to true

    simulationTest(
      'failing test',
      {
        role: 'test',
        task: 'test content',
        inputFn: (turn: number) => ({
          role: 'user',
          content: `Message for turn ${turn}`,
        }),
      },
      async ({ agent }) => {
        console.log('test is running.');
        simulationExpect(agent.events, async () => {
          expect(isThirdTurnPassed).toBe(true);
        }).eventually();
      }
    );
  });
});
