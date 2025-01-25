import { AgentEventEmitter, SimulationEvents, SimulationAgentState } from '../simulation/agent/SimulationAgent';

class SimulationExpectation {
  private eventEmitter: AgentEventEmitter;
  private assertionFn: (state: SimulationAgentState) => Promise<void>;

  constructor(
    eventEmitter: AgentEventEmitter,
    assertionFn: (state: SimulationAgentState) => Promise<void>
  ) {
    this.eventEmitter = eventEmitter;
    this.assertionFn = assertionFn;
  }

  when(conditionFn: (state: SimulationAgentState) => Promise<boolean> | boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      let conditionMet = false;
     
      const checkCondition = async (state: SimulationAgentState) => {
        try {
          const result = await conditionFn(state);
          if (result) {
            conditionMet = true;
            await this.assertionFn(state);
            resolve();
          } else if (state.isComplete) {
            reject(new Error(`Simulation completed but condition was never met.`));
          }
        } catch (error) {
          reject(error);
        }
      };

      this.eventEmitter.on(SimulationEvents.TURN_END, checkCondition);
      this.eventEmitter.on(SimulationEvents.COMPLETE, checkCondition);
    });
  }

  eventually(): Promise<void> {
    return this.when(state => state.isComplete);
  }
}

export const simulationExpect = (
  eventEmitter: AgentEventEmitter,
  assertionFn: (state: SimulationAgentState) => Promise<void>
): SimulationExpectation => {
  return new SimulationExpectation(eventEmitter, assertionFn);
};