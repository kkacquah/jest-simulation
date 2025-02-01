import { SimulatedUser, AgentConstructorArgs } from "./agent/SimulatedUser";
import { AgentSimulationEnvironment } from "./AgentSimulationEnvironment";

export interface SimulationContext {
  agent: SimulatedUser;
  logs: string[];
}

type SimulationFn = (context: SimulationContext) => void | Promise<void>;

type SimulationTestFn = {
  (name: string, agentArgs: AgentConstructorArgs, fn: SimulationFn): void;
  only: (
    name: string,
    agentArgs: AgentConstructorArgs,
    fn: SimulationFn
  ) => void;
  skip: (
    name: string,
    agentArgs: AgentConstructorArgs,
    fn: SimulationFn
  ) => void;
  todo: (name: string) => void;
  concurrent: (
    name: string,
    agentArgs: AgentConstructorArgs,
    fn: SimulationFn
  ) => void;
};

const createSimulationTest = (jestTestFn: jest.It) => {
  return async (
    name: string,
    agentArgs: AgentConstructorArgs,
    fn: SimulationFn
  ) => {
    jestTestFn(name, async () => {
      const logs: string[] = [];
      const runner = new AgentSimulationEnvironment(agentArgs);
      const agent = runner.getAgent();
      const context: SimulationContext = { agent, logs };

      try {
        await fn(context);
        await runner.runAllTurns();
      } catch (error) {
        throw error;
      }
    });
  };
};

/**
 * Creates a Jest test that executes a simulation with the following sequence:
 *
 * 1. Creates a AgentSimulationEnvironment with the provided configuration
 * 2. Allows test to set up event handlers and state
 * 3. Runs all turns of the simulation
 *
 * Example:
 * ```typescript
 * simulationTest(
 *   'captures all turn events',
 *   {
 *     getAgentResponse: (state) => ({ role: 'user', content: `Message ${state.currentTurn}` }),
 *     conversationGenerator: new DeterministicConversationGenerator(['response1', 'response2']),
 *     maxTurns: 3
 *   },
 *   async ({ agent }) => {
 *     simulationExpect(agent.events, async () => {
 *       expect(mockPrinterReset).toHaveBeenCalled();
 *     }).eventually();
 *   }
 * );
 * ```
 */
export const simulationTest: SimulationTestFn = Object.assign(
  createSimulationTest(test),
  {
    concurrent: createSimulationTest(test.concurrent),
    only: createSimulationTest(test.only),
    skip: createSimulationTest(test.skip),
    todo: test.todo,
  }
);
