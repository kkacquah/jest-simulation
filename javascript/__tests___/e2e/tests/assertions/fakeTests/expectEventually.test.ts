import { simulationExpect } from '../../../../../assertions/expect';
import { SimulationAgentState } from '../../../../../simulation/agent/SimulationAgent';
import { simulationTest } from '../../../../../simulation/simulationTest';

describe('expectEventually', () => {
  describe('should eventually pass when condition becomes true on third turn', () => {
    let isThirdTurnPassed = false;

    const getAgentResponse = (state: SimulationAgentState) => {
      if (state.currentTurn === 2) { // Third turn (0-based index)
        isThirdTurnPassed = true;
      }
      return { role: 'user', content: `Message for turn ${state.currentTurn}` };
    };

    simulationTest(
      'passing test',
      {
        role: 'test',
        task: 'test content',
        getAgentResponse,
      },
      async ({ agent }) => {
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
        getAgentResponse: (state: SimulationAgentState) => ({
          role: 'user',
          content: `Message for turn ${state.currentTurn}`,
        }),
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(isThirdTurnPassed).toBe(true);
        }).eventually();
      }
    );
  });
});
