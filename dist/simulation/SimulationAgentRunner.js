"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationAgentRunner = void 0;
const SimulationAgent_1 = require("./agent/SimulationAgent");
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
class SimulationAgentRunner {
    constructor(agentArgs) {
        this.agent = new SimulationAgent_1.SimulationAgent(agentArgs);
    }
    async runAllTurns() {
        // Initialize agent if not already initialized
        if (!this.agent.state.initialized) {
            await this.agent.initialize();
        }
        // Run turns until complete
        while (!this.agent.state.isComplete) {
            await this.agent.nextTurn();
        }
    }
    getAgent() {
        return this.agent;
    }
}
exports.SimulationAgentRunner = SimulationAgentRunner;
