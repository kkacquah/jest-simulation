import { simulationTest } from '../../src/simulation/simulationTest';
import { ConversationMessage, FakeConversationGenerator } from '../../src/simulation/agent/AgentConversationGenerator';

// Define the conversation flow upfront
const CONVERSATION_INPUTS: ConversationMessage[] = [
  { role: 'user', content: 'Hello, agent!' },
  { role: 'user', content: 'What is Jest?' },
  { role: 'user', content: 'How do I write tests?' },
  { role: 'user', content: 'Thank you for explaining!' },
  { role: 'user', content: 'Goodbye!' }
];

// Helper to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Conversation Simulation Tests', () => {
  simulationTest(
    'waits for async event handlers',
    { 
      role: 'assistant', 
      task: 'provide information',
      inputFn: (turn: number) => CONVERSATION_INPUTS[turn] || { role: 'user', content: 'end of conversation' },
      // Using custom generator to verify specific responses
      generator: new FakeConversationGenerator()
    },
    async ({ agent, logs }) => {
      // Add async handler that delays on turn 1
      agent.events.on('turnStart', async (state) => {
        if (state.currentTurn === 1) {
          logs.push('Processing turn 1...');
          await delay(100); // Simulate some async work
          logs.push('Finished processing turn 1');
        }
      });

      // Run 3 turns
      for (let i = 0; i < 3; i++) {
        await agent.nextTurn();
      }

      // Verify execution completed 3 turns
      expect(agent.state.currentTurn).toBe(3);
      expect(agent.state.isComplete).toBe(false); // Not complete since maxTurns is 50

      // Verify async processing occurred
      expect(logs).toContain('Processing turn 1...');
      expect(logs).toContain('Finished processing turn 1');
    }
  );

  simulationTest(
    'uses default generator when none provided',
    { 
      role: 'assistant', 
      task: 'provide information',
      inputFn: (turn: number) => ({ role: 'user', content: `Message ${turn}` })
    },
    async ({ agent }) => {
      await agent.nextTurn();
      
      expect(agent.state.lastInput?.content).toBe('Message 0');
      expect(agent.state.lastResponse?.role).toBe('assistant');
      expect(typeof agent.state.lastResponse?.content).toBe('string');
    }
  );
});
