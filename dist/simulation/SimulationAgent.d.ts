export interface SimulationAgentState {
    initialized: boolean;
    lastTurnArgs?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface AgentConstructorArgs {
    role: string;
    task: string;
}
export declare class SimulationAgent {
    role: string;
    task: string;
    state: SimulationAgentState;
    constructor({ role, task }: AgentConstructorArgs);
    initialize(): void;
    beginTurn(args: Record<string, unknown>): void;
    respond(input: string): string;
}
