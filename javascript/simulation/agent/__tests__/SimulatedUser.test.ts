import { describe, expect, jest, test } from '@jest/globals';
import { SimulatedUser } from '../SimulatedUser';
import { AgentConversationGenerator, ConversationMessage } from '../conversationGenerators/BaseConversationGenerator';

describe('SimulatedUser', () => {
  describe('nextTurn', () => {
    test('sets isComplete when conversation generator returns stop token', async () => {
      const mockGenerateResponse: jest.Mock<() => Promise<ConversationMessage>> = jest.fn();
      mockGenerateResponse.mockResolvedValue({
        role: 'user',
        stopTokenReturned: true
      });

      const mockInitialize = jest.fn();

      class MockConversationGenerator extends AgentConversationGenerator {
        generateResponse = mockGenerateResponse;
        initialize = mockInitialize;
      }

      const agent = new SimulatedUser({
        conversationGenerator: new MockConversationGenerator(),
        maxTurns: 5,
        getAgentResponse: () => Promise.resolve({ role: 'assistant', content: 'Hello world!' })
      });

      // Initialize the agent
      await agent.initialize();

      // Run one turn
      const state = await agent.nextTurn();

      // Verify the state is marked as complete
      expect(state.isComplete).toBe(true);
    });
  });
});