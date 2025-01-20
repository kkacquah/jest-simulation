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

export { SimulationAgent, type SimulationAgentState, type AgentConstructorArgs, type InputFunction } from './simulation/agent/SimulationAgent';
export { simulationTest, type SimulationContext } from './simulation/simulationTest';
export { SimulationAgentRunner } from './simulation/SimulationAgentRunner';
