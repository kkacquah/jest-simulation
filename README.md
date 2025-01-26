# Simulacra Framework

A TypeScript framework for simulating and testing agent-based conversations in Jest. This framework allows you to create, run, and test conversational agents with deterministic behavior for testing purposes.


## Usage

The framework is designed for easy testing with Jest. Use the FakeConversationGenerator to create deterministic tests:

This code demonstrates a simulation test for a restaurant booking scenario using the Jest Simulation Framework. It tests whether an agent can successfully complete a reservation process. The test uses `simulationTest` function with the following components:

1. Test description: "agent successfully completes restaurant booking"
2. Test configuration object:
   - `role`: Defines the user's persona
   - `task`: Specifies the user's objective
   - `inputFn`: Handles agent responses using a custom `YourConversationalAgent`
   - `generator`: Creates a simulated conversation using `FakeConversationGenerator`
3. Assertion function:
   - Uses `eventually` to check the agent's events
   - Verifies the booking details in the database match the expected reservation.

```typescript
simulationTest(
  'agent successfully completes restaurant booking',
  {
    role: "An elderly woman looking to help a friend make a reservation at Italian Restaurant",
    task: "You are trying to speak with a restaurant booking agent in order to make a reservation.",
    inputFn: (agentResponse) => YourConversationalAgent.respond(agentResponse),
    generator: new FakeConversationGenerator([
      { 
        role: "assistant", 
        content: "I'll help you make a reservation. What time and how many people?" 
      },
      { 
        role: "assistant", 
        content: "I can book a table for 4 people tomorrow at 7pm at Italian Restaurant. Should I proceed with the booking?" 
      },
      { 
        role: "assistant", 
        content: "Great! I've confirmed your reservation for tomorrow at 7pm for 4 people at Italian Restaurant. Your booking reference is #ABC123. Is there anything else you need?" 
      }
    ])
  },
  async ({ agent }) => {
    eventually(agent.events, async () => {
      const booking  = await db.getBooking("ABC123");
      expect(bookings).toEqual({
        restaurant: "Italian Restaurant",
        time: "7pm",
        date: "tomorrow",
        guests: 4,
        reference: "ABC123"
      });
    });
  }
);
```

MIT
