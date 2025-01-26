import { AgentConversationGenerator, ConversationMessage } from './AgentConversationGenerator';
import { OpenAIClient } from '../../llm/llm';

/**
 * A conversation generator that uses OpenAI's chat completion API.
 * Maintains conversation history and can be configured with a system prompt.
 */
interface LLMConversationGeneratorParams {
  model?: string;
}

export class LLMConversationGenerator extends AgentConversationGenerator {
  private client: OpenAIClient;

  constructor(params: LLMConversationGeneratorParams = {}) {
    super();
    this.client = new OpenAIClient({
      model: params.model ?? 'gpt-4',
    });;
  }

  initialize(systemPrompt: string): void {
    this.client.initializeChat(systemPrompt);
  }

  async generateResponse(input: ConversationMessage): Promise<ConversationMessage> {
    if (!this.client) {
      throw new Error('LLMConversationGenerator is not initialized');
    }
    return this.client.chat(input);
  }
}
