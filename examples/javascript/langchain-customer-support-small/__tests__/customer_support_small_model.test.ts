// Mock ES modules first - Jest hoists these calls
jest.mock("../src/nodes/RefundHandler");
jest.mock("../src/nodes/TechnicalSupportNode");

import { NodeInterrupt } from "@langchain/langgraph";
import { SimulationAgentState, simulationTest } from "simulacra-js";
import { simulationExpect } from "simulacra-js";
import { LLMConversationGenerator } from "simulacra-js";
import { app } from "../src/customer_support_small_model";
import { jest, describe, beforeEach, expect } from "@jest/globals";

// Import after mocks for proper hoisting
import { RefundHandler } from "../src/nodes/RefundHandler";
import { TechnicalSupportNode } from "../src/nodes/TechnicalSupportNode";
import { AssistantConversationMessage } from "simulacra-js/dist/simulation/agent/conversationGenerators/BaseConversationGenerator";

// Set timeout for long-running tests
jest.setTimeout(100000);

describe("Customer Support Model Tests", () => {
  let mockHandleRefund: jest.Mock;
  let mockHandleTechnicalSupport: jest.Mock;

  beforeEach(() => {
    // Create clean mock instances
    mockHandleRefund = jest.fn().mockReturnValue({
      messages: { role: "assistant", content: "Mock refund response" },
    }) as any;

    mockHandleTechnicalSupport = jest.fn().mockReturnValue({
      messages: {
        role: "assistant",
        content: "Mock technical support response",
      },
    });

    // Proper ES module mocking pattern
    RefundHandler.prototype.handle = mockHandleRefund as any;

    TechnicalSupportNode.prototype.handle = mockHandleTechnicalSupport as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getAgentResponse = async (
    simulatedUserState: SimulationAgentState
  ): Promise<AssistantConversationMessage> => {
    try {
      // Get the agent's response through the graph
      const response = await app.invoke([
        {
          role: "user",
          content:
            simulatedUserState.lastAgentResponse?.content ?? "",
        },
      ]);

      // Return the last message from the graph as the assistant's response
      const messages = response.messages;
      const lastMessage = messages[messages.length - 1];
      return {
        role: "assistant",
        content: lastMessage.content.toString(),
      };
    } catch (error) {
      if (error instanceof NodeInterrupt) {
        return {
          role: "assistant",
          content: error.message,
        };
      }
      throw error;
    }
  };

  simulationTest(
    "should call handleRefund when processing refund request",
    {
      conversationGenerator: new LLMConversationGenerator({
        model: "gpt-4o",
        role: "frustrated customer who recently purchased a faulty laptop",
        task: "You bought a laptop last week that keeps crashing. You have tried troubleshooting with tech support but nothing works. Now you want to request a refund for your purchase. Express your frustration politely but firmly.",
      }),
      getAgentResponse,
      maxTurns: 10,
    },
    async ({ agent }) => {
      simulationExpect(agent.events, async () => {
        expect(mockHandleRefund).toHaveBeenCalled();
      }).eventually();
    }
  );

  simulationTest(
    "should not call handleRefund when processing non-refund request",
    {
      getAgentResponse,
      conversationGenerator: new LLMConversationGenerator({
        model: "gpt-4o",
        role: "customer who recently purchased a new phone",
        task: "You have an old laptop with a fan that's making a loud whirring noise. You need technical support to figure out how to quiet it down or turn it off safely.",
      }),
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
