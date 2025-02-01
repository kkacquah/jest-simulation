import { Agent, AgentEnvironment } from '../agent';
import { DataSchema } from '../env/airline/dataSchema/DataSchema';
import { SimulationAgentState, simulationTest, simulationExpect } from 'simulacra-js';
import { LLMConversationGenerator } from 'simulacra-js/dist/simulation/agent/conversationGenerators/LLMConversationGenerator';
import * as fs from 'fs';
import * as path from 'path';
import { beforeEach, describe, expect } from '@jest/globals';
import { AssistantConversationMessage } from 'simulacra-js/dist/simulation/agent/conversationGenerators/BaseConversationGenerator.js';
import { TaskVerifier } from '../taskVerifier';

// Load tasks from file
const tasksPath = path.join(__dirname, '../env/airline/tasks/tasks.ts');
const tasksContent = fs.readFileSync(tasksPath, 'utf-8');

describe('Tau Bench Tests', () => {
  let agent: Agent;
  let taskVerifier: TaskVerifier;
  let dataSchema: DataSchema;

  beforeEach(() => {
    // Create fresh DataSchema instance with data directory
    const dataDir = path.join(__dirname, '../env/airline/dataSchema');
    dataSchema = new DataSchema(dataDir);
    
    // Initialize agent and task verifier with environment
    const environment: AgentEnvironment = {
      dataSchema
    };
    agent = new Agent(environment);
    taskVerifier = new TaskVerifier(dataSchema);
  });

  // Extract tasks array from the content
  const tasksMatch = tasksContent.match(/export const tasks = (\[[\s\S]*?\]);/);
  const tasks = tasksMatch ? eval(tasksMatch[1]) : [];

  // Create a test for each task
  tasks.forEach((task, index) => {
    simulationTest(
      `Task ${index + 1}: User ${task.user_id}`,
      {
        getAgentResponse: (state: SimulationAgentState): Promise<AssistantConversationMessage> => {
          if (!state.lastSimulationAgentResponse) {
            return Promise.resolve({
              role: 'assistant',
              content: 'Hello, I am your assistant. How can I help you today?'
            });
          }
          return agent.getAgentResponse(state, state.lastSimulationAgentResponse);
        },
        conversationGenerator: new LLMConversationGenerator({
          role: "You're a customer support agent for a major airline.",
          task: task.instruction,
          model: 'gpt-4'
        }),
        maxTurns: 10,
      },
      async ({ agent: simAgent }) => {
        await simulationExpect(simAgent.events, async () => {
          // Reset data for this verification

          // Execute agent
          const agentInstance = new Agent({ dataSchema });
          const result = await agentInstance.execute();

          // Verify task actions produce expected results
          const verifierResult = await taskVerifier.verifyTaskByIndex(index);
          
          // Verify hashes match
          expect(verifierResult.dataHash).toBe(result.dataHash);
        }).eventually();
      }
    );
  });
});
