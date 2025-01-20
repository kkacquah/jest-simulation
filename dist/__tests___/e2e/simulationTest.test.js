"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulationTest_1 = require("../../simulation/simulationTest");
const expectEventually_1 = require("../../assertions/expectEventually");
describe('simulationTest', () => {
    it('Should appropriately not fail for expectEventually for state update.', async () => {
        let isThirdTurnPassed = false;
        // Define the test function that would normally be passed to simulationTest
        const testFn = async () => {
            const inputFn = (turn) => {
                if (turn === 2) { // Third turn (0-based index)
                    isThirdTurnPassed = true;
                }
                return { role: 'user', content: `Message for turn ${turn}` };
            };
            // Execute the test directly
            await (0, simulationTest_1.simulationTest)('passing test', {
                role: 'test',
                task: 'test',
                inputFn,
                maxTurns: 5
            }, async () => {
                await (0, expectEventually_1.expectEventually)(() => {
                    expect(isThirdTurnPassed).toBe(true);
                });
            });
        };
        // Execute and verify it doesn't throw
        await expect(testFn()).resolves.not.toThrow();
    });
    it('Should appropriately fail for expectEventually with state update.', async () => {
        let isThirdTurnPassed = false;
        // Define the test function that would normally be passed to simulationTest
        const testFn = async () => {
            const inputFn = (turn) => {
                if (turn === 2) { // Third turn (0-based index)
                    isThirdTurnPassed = true;
                }
                return { role: 'user', content: `Message for turn ${turn}` };
            };
            // Execute the test directly
            await (0, simulationTest_1.simulationTest)('failing test', {
                role: 'test',
                task: 'test',
                inputFn,
                maxTurns: 5
            }, async () => {
                await (0, expectEventually_1.expectEventually)(() => {
                    expect(isThirdTurnPassed).toBe(false); // This should fail since isThirdTurnPassed becomes true
                });
            });
        };
        // Execute and verify it throws
        await expect(testFn()).rejects.toThrow();
    });
});
