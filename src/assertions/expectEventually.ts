import { AgentEventEmitter, SimulationEvents, SimulationAgentState } from '../simulation/agent/SimulationAgent';

export interface ExpectEventuallyOptions {
  timeout?: number;
}

export const expectEventually = async (
  eventEmitter: AgentEventEmitter,
  assertionFn: (state: SimulationAgentState) => Promise<void>,
  options: ExpectEventuallyOptions = {}
): Promise<void> => {
  const { timeout = 3000 } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Expectation not met within ${timeout}ms`));
    }, timeout);

    eventEmitter.on(SimulationEvents.COMPLETE, async (state) => {
      try {
        await assertionFn(state);
        clearTimeout(timeoutId);
        resolve();
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
};