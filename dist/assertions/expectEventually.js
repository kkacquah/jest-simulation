"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectEventually = void 0;
const expectEventually = async (fn, timeout = 3000, interval = 100) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            await fn();
            return; // If assertion passes, exit the function
        }
        catch (error) {
            await new Promise((resolve) => setTimeout(resolve, interval)); // Wait before retrying
        }
    }
    throw new Error(`Expectation not met within ${timeout}ms`);
};
exports.expectEventually = expectEventually;
