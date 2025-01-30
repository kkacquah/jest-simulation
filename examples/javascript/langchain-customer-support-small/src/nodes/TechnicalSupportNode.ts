import { SupportNode, StateType } from "./SupportNode";

const SYSTEM_TEMPLATE = `You are an expert at diagnosing technical computer issues. You work for a company called LangCorp that sells computers.
Help the user to the best of your ability, but be concise in your responses.`;
export class TechnicalSupportNode extends SupportNode {

  async handle(state: StateType): Promise<{ messages: any[]; nextRepresentative: string }> {
    const trimmedHistory = this.trimHistory(state.messages);

    const response = await this.model.invoke([
      { role: "system", content: SYSTEM_TEMPLATE },
      ...trimmedHistory,
    ]);

    return {
      messages: [response.content],
      nextRepresentative: "RESPOND",
    };
  }
}
