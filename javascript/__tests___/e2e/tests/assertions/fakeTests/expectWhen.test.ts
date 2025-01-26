import { simulationExpect } from '../../../../../assertions/expect';
import { DeterministicConversationGenerator } from '../../../../../simulation/agent/conversationGenerators/DeterministicConversationGenerator';
import { SimulationAgentState } from '../../../../../simulation/agent/SimulationAgent';
import { simulationTest } from '../../../../../simulation/simulationTest';

describe('expectWhen', () => {
  describe('should pass when condition becomes true during simulation', () => {
    let currentTurn = 0;

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
        conversationGenerator: new DeterministicConversationGenerator([
          { role: 'assistant', content: 'First message' },
          { role: 'assistant', content: 'Important message' },
          { role: 'assistant', content: 'Final message' }
        ])
      },
      async ({ agent }) => {
        // Test condition that depends on turn number
        simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(2);
        }).when(state => state.currentTurn === 2);

        // Test condition that depends on agent response
        simulationExpect(agent.events, async (state) => {
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
        getAgentResponse: (state: SimulationAgentState) => {
          messageCount++;
          return { role: 'user', content: `Message ${messageCount}` };
        }
      },
      async ({ agent }) => {
        // Check early turn condition
       simulationExpect(agent.events, async () => {
          console.log('Message count:', messageCount);
          expect(messageCount).toBe(1);
        }).when(state => state.currentTurn === 1);

        // Check mid-simulation condition
        simulationExpect(agent.events, async () => {
          expect(messageCount).toBe(3);
        }).when(state => state.currentTurn === 3);
      }
    );
  });

  describe('should support external state changes', () => {
    let externalCounter = 0;

    simulationTest(
      'passing test - external state changes',
      {
        role: 'test',
        task: 'test content',
        getAgentResponse: (state: SimulationAgentState) => {
          externalCounter++;
          return { role: 'user', content: `Message ${state.currentTurn}` };
        }
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(3);
        }).when(() => externalCounter === 3);
      }
    );
  });
});
