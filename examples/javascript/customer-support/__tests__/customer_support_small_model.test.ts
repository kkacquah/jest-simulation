import { NodeInterrupt } from '@langchain/langgraph';
import { simulationTest } from 'simulacra-test';
import { simulationExpect } from 'simulacra-test';
import { LLMConversationGenerator } from 'simulacra-test';
import { SimulationAgentState } from 'simulacra-test';
import { ConversationMessage } from 'simulacra-test';
import { app } from '../src/customer_support_small_model';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { RefundHandler } from '../src/nodes/RefundHandler';

// Mock refund handler module.
jest.mock('../src/nodes/RefundHandler');

// Set timeout for long-running tests
jest.setTimeout(100000);

describe('Customer Support Model Tests', () => {
  let mockHandleRefund: jest.Mock;

  beforeEach(() => {
    // Create a mock implementation of RefundHandler
    mockHandleRefund = jest.fn().mockReturnValue({
      messages: {
        role: "assistant",
        content: "Mock refund response"
      }
    });
    // Mock the entire class
    jest.mocked(RefundHandler).mockImplementation(() => ({
      handle: mockHandleRefund
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

    const getAgentResponse = async (simulationAgentState: SimulationAgentState): Promise<ConversationMessage> => {

      try {
        // Get the agent's response through the graph
        const response = await app.invoke([{
          role: 'user',
          content: simulationAgentState.lastResponse?.content ?? ''
        }]);
        
        // Return the last message from the graph as the assistant's response
        const messages = response.messages;
        const lastMessage = messages[messages.length - 1];
        return {
          role: 'assistant',
          content: lastMessage.content.toString()
        };
      } catch (error) {
        if (error instanceof NodeInterrupt) {
          return {
            role: 'assistant',
            content: error.message
          };
        }
        throw error;
      }
    };

    simulationTest(
      'should call handleRefund when processing refund request',
      {
        role: 'frustrated customer who recently purchased a faulty laptop',
        task: 'You bought a laptop last week that keeps crashing. You have tried troubleshooting with tech support but nothing works. Now you want to request a refund for your purchase. Express your frustration politely but firmly.',
        conversationGenerator: new LLMConversationGenerator(),
        getAgentResponse,
        debug: true,
        maxTurns: 10
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(mockHandleRefund).toHaveBeenCalled();
        }).eventually();
      }
    );

    simulationTest(
      'should not call handleRefund when processing non-refund request',
      {
        role: 'customer who recently purchased a new phone',
        task: 'You recently purchased a new phone from a local store. You are happy with the product but want to know more about the latest phone models.',
        getAgentResponse,
        conversationGenerator: new LLMConversationGenerator(),
        debug: true,
        maxTurns: 10
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(mockHandleRefund).not.toHaveBeenCalled();
        }).always();
      }
    );
  });