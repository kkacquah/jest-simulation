import { ConversationMessage } from "../simulation/agent/conversationGenerators/BaseConversationGenerator";

export interface SimulationResult {
  messages: ConversationMessage[];
  error?: Error;
}