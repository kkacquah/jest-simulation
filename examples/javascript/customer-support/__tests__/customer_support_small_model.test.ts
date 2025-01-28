import { NodeInterrupt } from '@langchain/langgraph';
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { simulationTest } from 'simulacra-test';
import { simulationExpect } from 'simulacra-test';
import { LLMConversationGenerator } from 'simulacra-test';
import { SimulationAgentState } from 'simulacra-test';
import { ConversationMessage } from 'simulacra-test';
import { app } from '../src/customer_support_small_model';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock refund handler module.
jest.mock('../src/nodes/RefundHandler', () => {
  return {
    RefundHandler: jest.fn()
  };
});
jest.mock('../src/nodes/TechnicalSupportNode', () => {
  return {
    TechnicalSupportNode: jest.fn()
  };
});

import { RefundHandler } from '../src/nodes/RefundHandler';
import { TechnicalSupportNode } from '../src/nodes/TechnicalSupportNode';

// Set timeout for long-running tests
jest.setTimeout(100000);

describe('Customer Support Model Tests', () => {
  let mockHandleRefund: jest.Mock<() => Promise<{ messages: { role: string; content: string; }}>>;
  let mockHandleTechnicalSupport: jest.Mock<() => Promise<{ messages: any[]; nextRepresentative: string; }>>;

  beforeEach(() => {
    // Create a mock implementation of RefundHandler
    mockHandleRefund = jest.fn().mockReturnValue({
      messages: {
        role: "assistant",
        content: "Mock refund response"
      }
    }) as jest.Mock<() => Promise<{ messages: { role: string; content: string; }}>>;
    mockHandleTechnicalSupport = jest.fn().mockReturnValue({
      messages: {
        role: "assistant",
        content: "Mock technical support response"
      }
    }) as jest.Mock<() => Promise<{ messages: any[]; nextRepresentative: string; }>>;
    console.log('RefundHandler is mock:', jest.isMockFunction(RefundHandler));
    console.log('TechnicalSupportNode is mock:', jest.isMockFunction(TechnicalSupportNode));
    // Mock the classes
    (RefundHandler as jest.Mock).mockImplementation(() => ({
      handle: mockHandleRefund
    }));
    (TechnicalSupportNode as jest.Mock).mockImplementation(() => ({
      handle: mockHandleTechnicalSupport,
      trimHistory: jest.fn().mockImplementation((messages) => messages)
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
        expect(mockHandleTechnicalSupport).toHaveBeenCalled();
      }).eventually();
      simulationExpect(agent.events, async () => {
        expect(mockHandleRefund).not.toHaveBeenCalled();
      }).always();
    }
  );
});