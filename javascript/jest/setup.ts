import { SimulationReporter } from "../reporter/SimulationReporter";

// Create a global instance of our reporter
declare global {
  var __SIMULATION_REPORTER__: SimulationReporter | undefined;
}

beforeAll(() => {
  global.__SIMULATION_REPORTER__ = new SimulationReporter();
});

afterAll(() => {
  if (global.__SIMULATION_REPORTER__) {
    global.__SIMULATION_REPORTER__.reportSimulation();
  }
  delete global.__SIMULATION_REPORTER__;
});
