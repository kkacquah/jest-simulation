import { ConversationMessage } from "./agent/conversationGenerators/BaseConversationGenerator";
import { AgentConstructorArgs, SimulationAgent } from "./agent/SimulationAgent";

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
        const newMessages = [newState.lastAgentResponse, newState.lastSimulationAgentResponse]
          .filter((message): message is ConversationMessage => message !== null);
        this.appendMessages(newMessages);
    
      } catch (error: Error | any) {
        console.error(`Error processing turn: ${error}`);
        this.completeTest(error);
        throw error;
      }
    }

    // Complete the test, if not already completed
    this.completeTest();
  }

  completeTest(error?: Error): void {
    if (global.jasmine) {
      const currentTest = (global as any).jasmine.currentTest;
      const reporter = global.__SIMULATION_REPORTER__;
      if (reporter && currentTest) {
        console.log(`\nTest: ${currentTest.title}`);
        console.log(`\nSimulation Result: ${this.messages}`);
        console.log(`\nError: ${error}`);
        reporter.addSimulationMessages(currentTest.testPath, {
          messages: this.messages,
          error
        });
      }
    }
  }

  getAgent(): SimulationAgent {
    return this.agent;
  }
}
