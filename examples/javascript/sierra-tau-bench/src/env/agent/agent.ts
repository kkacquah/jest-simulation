import { AssistantConversationMessage } from 'simulacra-js/dist/simulation/agent/conversationGenerators/BaseConversationGenerator';
import { DataSchema } from '../airline/dataSchema/DataSchema';
import { AllTools, ToolConstructor } from '../airline/tools';
import OpenAI from 'openai';
import zodToJsonSchema from 'zod-to-json-schema';

export interface AgentResult {
  success: boolean;
  error?: string;
  dataHash?: string;
}

export interface AgentEnvironment {
  dataSchema: DataSchema;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class Agent {
  private environment: AgentEnvironment;
  private tools: Record<string, ToolConstructor>;
  private client: OpenAI;
  private messageHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(environment: AgentEnvironment) {
    this.environment = environment;
    this.client = new OpenAI();
    
    // Store tool class references and convert to OpenAI tool format
    this.tools = Object.fromEntries(
      AllTools.map(ToolClass => [ToolClass.name.toLowerCase(), ToolClass])
    );
  }

  private getOpenAITools(): OpenAI.ChatCompletionTool[] {
    return AllTools.map(ToolClass => {
      const tool = new ToolClass();
      const info = tool.getInfo();
      
      return {
        type: 'function',
        function: {
          name: info.name,
          description: info.description,
          parameters: zodToJsonSchema(info.parameters)
        },
      };
    });
  }

  /**
   * Process a user message and generate a response
   */
  async getAgentResponse(_state: any, message: ConversationMessage): Promise<AssistantConversationMessage> {
    this.messageHistory.push({
      role: 'user',
      content: message.content,
    });

    return this.getNextResponse();
  }

  private async getNextResponse(): Promise<AssistantConversationMessage> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: this.messageHistory,
      tools: this.getOpenAITools(),
      tool_choice: 'auto',
    });

    const response = completion.choices[0].message;
    this.messageHistory.push(response);

    if (!response.tool_calls) {
      return {
        role: 'assistant',
        content: response.content || 'No action needed',
      };
    }

    const toolCall = response.tool_calls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    const ToolClass = this.tools[toolName.toLowerCase()];
    if (!ToolClass) {
      return {
        role: 'assistant',
        content: `Error: Tool not found: ${toolName}`,
      };
    }

    const tool = new ToolClass();
    const result = await tool.invoke(this.environment.dataSchema, toolArgs);

    this.messageHistory.push({
      role: 'tool',
      content: JSON.stringify(result),
      tool_call_id: toolCall.id,
    });

    return this.getNextResponse();
  }

  /**
   * Get information about available tools and their capabilities
   */
  getToolInfo(): Record<string, any>[] {
    return Object.values(this.tools).map(tool => {
      const instance = new tool();
      return instance.getInfo();
    });
  }
}