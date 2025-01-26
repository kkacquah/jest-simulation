import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { MessagesAnnotation, Annotation, StateDefinition } from "@langchain/langgraph";

// Define the state interface
export interface StateShape {
  messages: typeof MessagesAnnotation;
  nextRepresentative: string;
  refundAuthorized: boolean;
}

// Define state annotation
export const StateAnnotation = Annotation.Root<StateDefinition>({
  ...MessagesAnnotation.spec,
  nextRepresentative: Annotation<string>,
  refundAuthorized: Annotation<boolean>,
});

export type StateType = {
  messages: Array<{ role: string; content: string }>;
  nextRepresentative: string;
  refundAuthorized: boolean;
  model?: {
    lc: number;
    type: string;
    id: string[];
    kwargs: {
      model: string;
      temperature: number;
    };
  };
  SYSTEM_TEMPLATE?: string;
  CATEGORIZATION_SYSTEM_TEMPLATE?: string;
  CATEGORIZATION_HUMAN_TEMPLATE?: string;
}

export abstract class SupportNode {
  protected model: ChatTogetherAI;

  constructor(model: ChatTogetherAI) {
    this.model = model;
  }

  protected trimHistory(messages: any[]): any[] {
    if (messages.at(-1)?._getType() === "ai") {
      return messages.slice(0, -1);
    }
    return messages;
  }

  abstract handle(state: StateType): Promise<any>;
}
