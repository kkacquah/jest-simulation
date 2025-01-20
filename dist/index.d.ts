declare global {
    namespace jest {
        interface Matchers<R> {
        }
    }
}
export default function setupJestSimulation(): void;
export { SimulationAgent, type SimulationAgentState, type AgentConstructorArgs, type InputFunction } from './simulation/agent/SimulationAgent';
export { simulationTest, type SimulationContext } from './simulation/simulationTest';
export { SimulationAgentRunner } from './simulation/SimulationAgentRunner';
