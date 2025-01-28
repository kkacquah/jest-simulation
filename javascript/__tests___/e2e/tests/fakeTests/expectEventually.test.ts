import { simulationExpect } from '../../../../assertions/expect';
import { AssistantConversationMessage } from '../../../../simulation/agent/conversationGenerators/BaseConversationGenerator';
import { DeterministicConversationGenerator } from '../../../../simulation/agent/conversationGenerators/DeterministicConversationGenerator';
import { SimulationAgentState } from '../../../../simulation/agent/SimulationAgent';
import { simulationTest } from '../../../../simulation/simulationTest';
import { DEFAULT_CONVERSATION_GENERATOR_MESSAGES } from '../assertions/utils';

describe('expectEventually', () => {
  describe('should eventually pass when condition becomes true on third turn', () => {
    let isThirdTurnPassed = false;

    const getAgentResponse = (state: SimulationAgentState): AssistantConversationMessage => {
      if (state.currentTurn === 2) { // Third turn (0-based index)
        isThirdTurnPassed = true;
      }
      return { role: 'assistant', content: `Message for turn ${state.currentTurn}` };
    };

    simulationTest(
      'passing test',
      {
        getAgentResponse,
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES)
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
        getAgentResponse: (state: SimulationAgentState) => ({
          role: 'assistant',
          content: `Message for turn ${state.currentTurn}`,
        }),
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES)
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(isThirdTurnPassed).toBe(true);
        }).eventually();
      }
    );
  });
  describe('should fail when condition never becomes true (2 turns)', () => {
    let isThirdTurnPassed = false; // This will never be set to true

    simulationTest(
      'failing test',
      {
        getAgentResponse: (state: SimulationAgentState) => ({
          role: 'assistant',
          content: `Message for turn ${state.currentTurn}`,
        }),
        maxTurns: 2,
        conversationGenerator: new DeterministicConversationGenerator(DEFAULT_CONVERSATION_GENERATOR_MESSAGES)
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(isThirdTurnPassed).toBe(true);
        }).eventually();
      }
    );
  });
});
