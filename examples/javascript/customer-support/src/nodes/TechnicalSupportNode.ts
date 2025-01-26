import { SupportNode, StateType } from "./SupportNode";

export class TechnicalSupportNode extends SupportNode {

  private readonly SYSTEM_TEMPLATE = `You are an expert at diagnosing technical computer issues. You work for a company called LangCorp that sells computers.
Help the user to the best of your ability, but be concise in your responses.`;

  async handle(state: StateType): Promise<{ messages: any[]; nextRepresentative: string }> {
    const trimmedHistory = this.trimHistory(state.messages);

    const response = await this.model.invoke([
      { role: "system", content: this.SYSTEM_TEMPLATE },
      ...trimmedHistory,
    ]);

    return {
      messages: [response.content],
      nextRepresentative: "RESPOND",
    };
  }

  async invoke(input: StateType): Promise<any> {
    return this.handle(input);
  }
}
