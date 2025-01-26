import { NodeInterrupt } from '@langchain/langgraph';
import { simulationTest } from '../../../src/simulation/simulationTest';
import { simulationExpect } from '../../../src/assertions/expect';
import { LLMConversationGenerator } from '../../../src/simulation/agent/conversationGenerators/LLMConversationGenerator';
import { SimulationAgentState } from '../../../src/simulation/agent/SimulationAgent';
import { ConversationMessage } from '../../../src/simulation/agent/conversationGenerators/AgentConversationGenerator';
import { app } from '../src/customer_support_small_model';
// Mock all node modules
jest.mock('../src/nodes/RefundHandler');

// TODO: I'm unsure why I need this. I tried to set a longer timeout in jest.config.js
jest.setTimeout(100000);
// Import the actual implementation after mocking
import { RefundHandler } from '../src/nodes/RefundHandler';

describe('Customer Support Model Tests', () => {
  let mockHandleRefund: jest.Mock<any>;
  
  beforeEach(() => {
    mockHandleRefund = (RefundHandler as jest.Mock).mockImplementation(() => ({
      handle: jest.fn().mockResolvedValue({ type: 'refund_response', content: 'Mock refund response' }),
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

    const inputFn = async (agentState: SimulationAgentState): Promise<ConversationMessage> => {

      try {
        // Get the agent's response through the graph
        const response = await app.invoke([{
          role: 'user',
          content: agentState.lastResponse?.content ?? ''
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
        generator: new LLMConversationGenerator(),
        inputFn,
        debug: true,
        maxTurns: 10
      },
      async ({ agent }) => {
        simulationExpect(agent.events, async () => {
          expect(mockHandleRefund).toHaveBeenCalled();
        }).eventually();
      }
    );
  });