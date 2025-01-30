import { describe, test, expect } from '@jest/globals';
import { SimulacraTest } from 'simulacra-js';

describe('Sierra Tau Benchmark', () => {
  test('basic conversation test', async () => {
    const test = new SimulacraTest({
      agentPrompt: `You are Sierra, a helpful AI assistant focused on clear and concise communication.
      You should always respond in a friendly but professional manner.`,
      testCases: [
        {
          input: "What's the weather like today?",
          expectedBehaviors: [
            "Explains inability to check real-time weather",
            "Maintains professional tone"
          ]
        },
        {
          input: "Tell me a joke",
          expectedBehaviors: [
            "Responds with appropriate humor",
            "Keeps content family-friendly"
          ]
        }
      ]
    });

    const results = await test.run();
    expect(results.success).toBe(true);
  });
});
