"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationAgentRunner = exports.simulationTest = exports.SimulationAgent = void 0;
exports.default = setupJestSimulation;
// This will be called automatically by Jest
function setupJestSimulation() {
    // Add your Jest extensions here
    expect.extend({
    // Add custom matchers here
    });
}
var SimulationAgent_1 = require("./simulation/agent/SimulationAgent");
Object.defineProperty(exports, "SimulationAgent", { enumerable: true, get: function () { return SimulationAgent_1.SimulationAgent; } });
var simulationTest_1 = require("./simulation/simulationTest");
Object.defineProperty(exports, "simulationTest", { enumerable: true, get: function () { return simulationTest_1.simulationTest; } });
var SimulationAgentRunner_1 = require("./simulation/SimulationAgentRunner");
Object.defineProperty(exports, "SimulationAgentRunner", { enumerable: true, get: function () { return SimulationAgentRunner_1.SimulationAgentRunner; } });
