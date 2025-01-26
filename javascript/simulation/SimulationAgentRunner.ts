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

  constructor(agentArgs: AgentConstructorArgs) {
    this.agent = new SimulationAgent(agentArgs);
  }

  // If we're running in Jest, report the messages
  reportTestMessages(newMessages: ConversationMessage[]): void {
    if (global.jasmine) {
      const currentTest = (global as any).jasmine.currentTest;
      const reporter = global.__SIMULATION_REPORTER__;
      if (reporter && currentTest) {
        reporter.addSimulationMessages(currentTest.testPath, newMessages);
      }
    }
  }

  async runAllTurns(): Promise<void> {
    // Full set of messages from the simulation.
    const simulationMessages: ConversationMessage[] = [];
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
        this.reportTestMessages(newMessages);
    
      } catch (error) {
        console.error(`Error processing turn: ${error}`);
      }
    }
  }

  getAgent(): SimulationAgent {
    return this.agent;
  }
}
