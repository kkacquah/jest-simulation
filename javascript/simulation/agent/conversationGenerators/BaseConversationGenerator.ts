
export type AssistantConversationMessage = {
  role: 'assistant'
  content: string
} 

export type UserConversationContentMessage = {
  role: 'user'
  content: string
}

export type UserConversationStopMessage = {
  role: 'user'
  stopTokenReturned: true
}

export type UserConversationMessage = UserConversationContentMessage | UserConversationStopMessage;
/**
 * Represents a message in the conversation
 */
export type ConversationMessage  = AssistantConversationMessage | UserConversationMessage

/**
 * Abstract base class for generating agent conversation responses.
 * Implemented by various generators like DeterministicConversationGenerator and LLMConversationGenerator.
 */
export abstract class AgentConversationGenerator {
  abstract initialize(systemPrompt?: string): void
  abstract generateResponse(input: ConversationMessage): Promise<ConversationMessage>;
}
