import { simulationExpect } from '../../../../../assertions/expect';
import { FakeConversationGenerator } from '../../../../../simulation/agent/conversationGenerators/FakeConversationGenerator';
import { SimulationAgentState } from '../../../../../simulation/agent/SimulationAgent';
import { simulationTest } from '../../../../../simulation/simulationTest';

describe('expectWhen', () => {
  describe('should pass when condition becomes true during simulation', () => {
    let currentTurn = 0;
    let messageReceived = '';

    const inputFn = (state: SimulationAgentState) => {
      currentTurn = state.currentTurn;
      return { role: 'user', content: `Message for turn ${state.currentTurn}` };
    };

    simulationTest(
      'passing test - condition met on specific turn',
      {
        role: 'test',
        task: 'test content',
        inputFn,
        generator: new FakeConversationGenerator([
          { role: 'assistant', content: 'First message' },
          { role: 'assistant', content: 'Important message' },
          { role: 'assistant', content: 'Final message' }
        ])
      },
      async ({ agent }) => {
        // Test condition that depends on turn number
        await simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(2);
        }).when(state => state.currentTurn === 2);

        // Test condition that depends on agent response
        await simulationExpect(agent.events, async (state) => {
          expect(state.lastResponse?.content).toBe('Important message');
        }).when(state => state.lastResponse?.content === 'Important message');
      }
    );
  });

  describe('should support multiple conditions in same test', () => {
    let messageCount = 0;

    simulationTest(
      'passing test - multiple conditions',
      {
        role: 'test',
        task: 'test content',
        inputFn: () => {
          messageCount++;
          return { role: 'user', content: `Message ${messageCount}` };
        }
      },
      async ({ agent }) => {
        // Check early turn condition
        await simulationExpect(agent.events, async () => {
          expect(messageCount).toBe(1);
        }).when(state => state.currentTurn === 0);

        // Check mid-simulation condition
        await simulationExpect(agent.events, async () => {
          expect(messageCount).toBe(2);
        }).when(state => state.currentTurn === 1);
      }
    );
  });
});
