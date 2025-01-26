import { NodeInterrupt } from "@langchain/langgraph";
import { StateType } from "./SupportNode";

export class RefundHandler {

  async handle(state: StateType) {
    console.log("Real refund handler has been called.");
    if (!state.refundAuthorized) {
      console.log("--- HUMAN AUTHORIZATION REQUIRED FOR REFUND ---");
      throw new NodeInterrupt("Human authorization required.");
    }
    return {
      messages: {
        role: "assistant",
        content: "Refund processed!",
      },
    };
  }

  async invoke(input: StateType): Promise<any> {
    return this.handle(input);
  }
}
