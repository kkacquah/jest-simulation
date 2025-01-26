import { AgentConversationGenerator, ConversationMessage } from './BaseConversationGenerator';
import { OpenAIClient } from '../../llm/llm';

/**
 * A conversation generator that uses OpenAI's chat completion API.
 * Maintains conversation history and can be configured with a system prompt.
 */
interface LLMConversationGeneratorParams {
  model?: string;
  role: string;
  task: string;
}

export class LLMConversationGenerator extends AgentConversationGenerator {
  private client: OpenAIClient;
  private role: string;
  private task: string;

  constructor(params: LLMConversationGeneratorParams) {
    super();
    this.client = new OpenAIClient({
      model: params.model ?? 'gpt-4',
    });
    this.role = params.role;
    this.task = params.task;
  }

  initialize(): void {
    const generatedPrompt = this.getSystemPromptFromRoleAndTask(this.role, this.task);
    this.client.initializeChat(generatedPrompt);
  }

  private getSystemPromptFromRoleAndTask(role: string, task: string): string {
    return `### Role
    ${role}.
    
    ### Task
    ${task} 
    
    ### Style
    Respond concisely and stay in character.`;
  }

  async generateResponse(input: ConversationMessage): Promise<ConversationMessage> {
    if (!this.client) {
      throw new Error('LLMConversationGenerator is not initialized');
    }
    return this.client.chat(input);
  }
}
