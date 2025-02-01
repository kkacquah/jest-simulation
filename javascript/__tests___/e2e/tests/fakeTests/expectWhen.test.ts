import { simulationExpect } from '../../../../assertions/expect';
import { UserConversationContentMessage } from '../../../../simulation/agent/conversationGenerators/BaseConversationGenerator';
import { DeterministicConversationGenerator } from '../../../../simulation/agent/conversationGenerators/DeterministicConversationGenerator';
import { SimulatedUserState } from '../../../../simulation/agent/SimulatedUser';
import { simulationTest } from '../../../../simulation/simulationTest';
import { DEFAULT_CONVERSATION_GENERATOR_MESSAGES } from '../assertions/utils';

describe('expectWhen', () => {
  describe('should pass when condition becomes true during simulation', () => {

    simulationTest(
      'should pass when condition becomes true during simulation',
      {
        getAgentResponse: (state: SimulatedUserState) => {
          return { role: 'assistant', content: `Message for turn ${state.currentTurn}` };
        },
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
          expect('content' in state.lastSimulatedUserResponse!).toBe(true);
          expect((state.lastSimulatedUserResponse as UserConversationContentMessage).content).toBe('Important message');
        }).when(state => (state.lastSimulatedUserResponse as UserConversationContentMessage).content === 'Important message');
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
          return { role: 'assistant', content: `Message ${messageCount}` };
        }
        
      },
      async ({ agent }) => {
        // Check early turn condition
       simulationExpect(agent.events, async (state) => {
          expect(messageCount).toBe(1);
        }).when(state => state.currentTurn === 1);

        // Check mid-simulation condition
        simulationExpect(agent.events, async (state) => {
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
        getAgentResponse: (state: SimulatedUserState) => {
          externalCounter++;
          return { role: 'assistant', content: `Message ${state.currentTurn}` };
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

  describe('should succeed if condition never becomes true', () => {
    let externalCounter = 0;

    simulationTest(
      'passing test - external state changes',
      {
        getAgentResponse: (state: SimulatedUserState) => {
          externalCounter++;
          return { role: 'assistant', content: `Message ${state.currentTurn}` };
        },
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES)
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async (state) => {
          expect(state.currentTurn).toBe(3);
        }).when(() => externalCounter === 20);
      }
    );
  });
});
