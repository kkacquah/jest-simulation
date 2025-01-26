import type { Config } from '@jest/types';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matchers here
    }
  }
}

// This will be called automatically by Jest
export default function setupJestSimulation() {
  // Add your Jest extensions here
  expect.extend({
    // Add custom matchers here
  });
}

// Core simulation types and functions
export { 
  SimulationAgent, 
  type SimulationAgentState, 
  type AgentConstructorArgs, 
  type GetAgentResponseFunction,
  SimulationEvents
} from './simulation/agent/SimulationAgent';

export { 
  simulationTest, 
  type SimulationContext 
} from './simulation/simulationTest';

// Conversation generators
export { 
  type ConversationMessage,
  type AgentConversationGenerator 
} from './simulation/agent/conversationGenerators/BaseConversationGenerator';

export { 
  DeterministicConversationGenerator 
} from './simulation/agent/conversationGenerators/DeterministicConversationGenerator';

export { 
  LLMConversationGenerator 
} from './simulation/agent/conversationGenerators/LLMConversationGenerator';

// Assertions
export { 
  simulationExpect 
} from './assertions/expect';

export { SimulationAgentRunner } from './simulation/SimulationAgentRunner';
