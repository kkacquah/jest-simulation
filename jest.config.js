module.exports = {
  reporters: [
    "default",
    ["<rootDir>/javascript/reporter/SimulationReporter.ts", {
      // Ensure hooks are properly recognized
      enableTestEventHandlers: true
    }]
  ]
} 