"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationAgent = void 0;
class SimulationAgent {
    constructor({ role, task }) {
        this.role = role;
        this.task = task;
        this.state = { initialized: false };
    }
    initialize() {
        this.state.initialized = true;
        console.log(`Initialized agent with role: ${this.role}, task: ${this.task}`);
    }
    beginTurn(args) {
        console.log('Starting turn with:', args);
        this.state.lastTurnArgs = args;
    }
    respond(input) {
        console.log(`${this.role} responding to "${input}"`);
        return `Response from ${this.role}: handling "${this.task}"`;
    }
}
exports.SimulationAgent = SimulationAgent;
