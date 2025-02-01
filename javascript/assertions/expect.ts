import {
  AgentEventEmitter,
  SimulationEvents,
  SimulatedUserState,
  TestEvents,
} from "../simulation/agent/SimulatedUser";

class SimulationExpectation {
  private eventEmitter: AgentEventEmitter;
  private assertionFn: (state: SimulatedUserState) => Promise<void>;

  constructor(
    eventEmitter: AgentEventEmitter,
    assertionFn: (state: SimulatedUserState) => Promise<void>
  ) {
    this.eventEmitter = eventEmitter;
    this.assertionFn = assertionFn;
  }

  when(
    conditionFn: (state: SimulatedUserState) => Promise<boolean> | boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let conditionMet = false;

      const checkCondition = async (state: SimulatedUserState) => {
        try {
          const result = await conditionFn(state);
          if (result) {
            conditionMet = true;
            await this.assertionFn(state);
            resolve();
          } else if (state.isComplete) {
            const error = new Error(
              `Simulation completed but condition was never met.`
            );
            this.eventEmitter.emit(TestEvents.ERROR, error);
            resolve();
          }
        } catch (error: Error | any) {
          this.eventEmitter.emit(TestEvents.ERROR, error);
          reject(error);
        }
      };

      this.eventEmitter.on(SimulationEvents.TURN_END, checkCondition);
    });
  }

  eventually(): Promise<void> {
    return this.when((state) => state.isComplete);
  }

  always(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkAssertion = async (state: SimulatedUserState) => {
        try {
          await this.assertionFn(state);
        } catch (error) {
          reject(error);
        }
      };

      this.eventEmitter.on(SimulationEvents.TURN_END, checkAssertion);
      this.eventEmitter.on(SimulationEvents.COMPLETE, async (state) => {
        await checkAssertion(state);
        resolve(void 0);
      });
    });
  }
}

export const simulationExpect = (
  eventEmitter: AgentEventEmitter,
  assertionFn: (state: SimulatedUserState) => Promise<void>
): SimulationExpectation => {
  return new SimulationExpectation(eventEmitter, assertionFn);
};
