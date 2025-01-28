## NOTE

In the future, simulacra will be split into two packages:
- `simulacra-js` (currently hosted under `/javascript`)
- `simulacra-py` (to be hosted under `/python`)

But the description below describes usage for "simulacra-js", a javascript version of the simulacra framework.

# SimulacraJS

A TypeScript framework for simulating conversations with conversational agents in Jest. This framework define simulation agents that speak with your conversational agents with a rich assertion API for you to test expected agent behavior.

## Features

- Simulate conversations with deterministic or LLM-powered responses
- Rich assertion API for testing agent behavior.
- Automated reporting of simulation results. 
- Extends the full power of[Jest's test framework](https://jestjs.io/).

## Roadmap
- [ ] Support for test parallelization
- [ ] Support for (cheaper) simulation agent models
- [ ] LLM-as-judge transcript conversation transcript evaluation
- [ ] Support "streamed input", which waits for an "stop" token before generating an agent response
- [ ] Anything else! We're open to suggestions!

## Set up

1. Install the framework using `npm install simulacra`
2. Define your test using `simulationTest` in a file with a `agent.test.ts` extension
3. Add OPENAI_API_KEY to your environment variables (if using LLM-powered responses)
4. Run your new agent tests using `npx jest agent.test.ts`.

Look at the [examples](./examples) for an example of a project setup to use the framework.

## Usage

The framework provides two main ways to generate conversations:

1. `DeterministicConversationGenerator` for deterministic tests with predefined user messages
2. `LLMConversationGenerator` for testing with real language models

Here's an example testing a customer support scenario:

```typescript
simulationTest(
  'should handle refund requests appropriately',
  {
    conversationGenerator: new LLMConversationGenerator({
      role: 'frustrated customer who recently purchased a faulty laptop',
      task: 'You bought a laptop last week that keeps crashing. You have tried troubleshooting with tech support but nothing works. Now you want to request a refund.',
      model: 'gpt-4' // optional, defaults to gpt-4
    }),
    getAgentResponse: (simulationAgentState) => {
      // Your agent logic here
      return handleCustomerRequest(simulationAgentState.lastResponse?.content);
    },
  },
  async ({ agent }) => {
    // Test that refund handler was called
    simulationExpect(agent.events, async () => {
      expect(mockHandleRefund).toHaveBeenCalled();
    }).eventually();
  }
);
```

You can also use `DeterministicConversationGenerator` to test a conversational agent with a specific sequence of user messages:

```typescript
simulationTest(
  'should handle a specific conversation flow',
  {
    conversationGenerator: new DeterministicConversationGenerator([
      "I understand you're having issues with a printer jam. Have you tried removing all paper and checking for debris?",
      "Let's try resetting the printer. Please turn it off, wait 30 seconds, then turn it back on.",
      "Great! The printer should now be working correctly. Is there anything else you need help with?"
    ]),
    getAgentResponse: (simulationAgentState) => handleTechSupport(simulationAgentState.lastResponse?.content)
  },
  async ({ agent }) => {
    simulationExpect(agent.events, async () => {
      expect(mockPrinterReset).toHaveBeenCalled();
    }).eventually();
  }
);
```

## Assertions

The framework provides powerful assertion capabilities through `simulationExpect`:

- `eventually()`: Asserts a condition is true by the end of the simulation

```typescript
// Assert something happens by the end of a simulation
simulationExpect(simulationAgent.events, async (simulationAgent) => {
  expect(simulationAgent.lastReceivedMessage?.content).toMatchSnapshot();
}).eventually();
```

- `always()`: Asserts a condition remains true throughout the entire simulation

```typescript
// Assert something remains true throughout a simulation
simulationExpect(simulationAgent.events, async (simulationAgent) => {
  expect(mockDeleteUserData.notToBeCalled()).toBe(true);
}).always();
```

- `when(condition)`: Asserts a condition when a specific state is met

```typescript
// Assert something when a condition is met during a simulation
simulationExpect(simulationAgent.events, async (simulationAgent) => {
  expect(mockDeleteUserData).toBeCalled();
}).when(state => state.lastSimulationAgentResponse?.content === 'Please delete my data.');
```

## Reporting

Simulacra displays errors within the context of the conversation between the simulation agent and your agent, providing clear and detailed test output:

```
Test Failures:

In /Users/kennethacquah/simulacra/javascript/__tests___/e2e/tests/fakeTests/expectEventually.test.ts:
✗ expectEventually should fail when condition never becomes true failing test
  13. [assistant] Message for turn 7
  14. [user] Is there anything else you need?
  15. [assistant] Message for turn 8
  16. [user] Thank you for your patience.
  17. [assistant] Message for turn 9
  18. [user] Have a great day!
  (12 earlier steps not shown)

  expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
  Stack trace:
    
    Expected: true
    Received: false
    at SimulationExpectation.assertionFn (/Users/kennethacquah/simulacra/javascript/__tests___/e2e/tests/fakeTests/expectEventually.test.ts:47:37)
    at AgentEventEmitter.checkCondition (/Users/kennethacquah/simulacra/javascript/assertions/expect.ts:31:24)

Test Summary:
Total Tests: 1
Passed: 0
Failed: 1
```

The output includes:
- File path of the failing test
- Test name with fail status (✗)
- Detailed error message and stack trace for failures, in context of conversation with your agent.
- Summary of total tests, passes, and failures

## License

MIT
