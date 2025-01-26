import { simulationExpect } from '../../../../../assertions/expect';
import { DeterministicConversationGenerator } from '../../../../../simulation/agent/conversationGenerators/DeterministicConversationGenerator';
import { SimulationAgentState } from '../../../../../simulation/agent/SimulationAgent';
import { simulationTest } from '../../../../../simulation/simulationTest';
import { DEFAULT_CONVERSATION_GENERATOR_MESSAGES } from '../utils';

describe('expectWhen', () => {
  describe('should pass when condition becomes true during simulation', () => {
    let currentTurn = 0;

    const getAgentResponse = (state: SimulationAgentState) => {
      currentTurn = state.currentTurn;
      return { role: 'user', content: `Message for turn ${state.currentTurn}` };
    };

    simulationTest(
      'passing test - condition met on specific turn',
      {
        getAgentResponse,
        conversationGenerator: new DeterministicConversationGenerator([
          'First message',
          'Important message',
          'Final message'
        ])
      },
      async ({ agent }) => {
        // Test condition that depends on turn number
        simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(2);
        }).when(state => state.currentTurn === 2);

        // Test condition that depends on agent response
        simulationExpect(agent.events, async (state) => {
          expect(state.lastSimulationAgentResponse?.content).toBe('Important message');
        }).when(state => state.lastSimulationAgentResponse?.content === 'Important message');
      }
    );
  });

  describe('should support multiple conditions in same test', () => {
    let messageCount = 0;

    simulationTest(
      'passing test - multiple conditions',
      {
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES),
        getAgentResponse: () => {
          messageCount++;
          return { role: 'user', content: `Message ${messageCount}` };
        }
        
      },
      async ({ agent }) => {
        // Check early turn condition
       simulationExpect(agent.events, async () => {
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
        getAgentResponse: (state: SimulationAgentState) => {
          externalCounter++;
          return { role: 'user', content: `Message ${state.currentTurn}` };
        },
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES)
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(3);
        }).when(() => externalCounter === 3);
      }
    );
  });
});
