import { ConversationMessage } from "./agent/conversationGenerators/BaseConversationGenerator";
import {
  AgentConstructorArgs,
  SimulationAgent,
  TestEvents,
} from "./agent/SimulationAgent";

/**
 * SimulationAgentRunner manages the lifecycle of a SimulationAgent.
 * It provides a high-level interface for running a complete simulation
 * while maintaining separation between the simulation logic and its execution.
 *
 * The runner is responsible for:
 * 1. Creating and initializing the agent
 * 2. Running all turns until completion
 * 3. Providing access to the agent for event handling and state inspection
 *
 * This separation allows tests to set up event handlers and verify state
 * before the simulation begins running.
 */
export class SimulationAgentRunner {
  private agent: SimulationAgent;
  private messages: ConversationMessage[] = [];

  constructor(agentArgs: AgentConstructorArgs) {
    this.agent = new SimulationAgent(agentArgs);

    // Listen for errors and pass them to completeTest
    this.agent.events.on(TestEvents.ERROR, (error: Error) => {
      this.completeTest(error);
    });
  }

  appendMessages(newMessages: ConversationMessage[]): void {
    this.messages.push(...newMessages);
  }

  async runAllTurns(): Promise<void> {
    // Initialize agent if not already initialized.
    if (!this.agent.state) {
      await this.agent.initialize();
    }

    // Run turns until complete
    while (this.agent.state && !this.agent.state.isComplete) {
      try {
        const newState = await this.agent.nextTurn();
        const newMessages = [
          newState.lastAgentResponse,
          newState.lastSimulatedUserResponse,
        ].filter((message): message is ConversationMessage => message !== null);
        this.appendMessages(newMessages);
      } catch (error: Error | any) {
        this.completeTest(error);
      }
    }
    // Complete the test, if not already completed
    this.completeTest();
  }

  completeTest(error?: Error): void {
    if (global.__SIMULATION_REPORTER__) {
      const state = expect.getState();
      global.__SIMULATION_REPORTER__.setSimulationResult(
        { 
          messages: this.messages, 
          error,
          path: state.testPath!,
          testName: state.currentTestName!
        }
      );
    }
  }

  getAgent(): SimulationAgent {
    return this.agent;
  }
}
