import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { SupportNode, StateType } from "./SupportNode";

export class BillingSupportNode extends SupportNode {

  private readonly SYSTEM_TEMPLATE = `You are an expert billing support specialist for LangCorp, a company that sells computers.
Help the user to the best of your ability, but be concise in your responses.
You have the ability to authorize refunds, which you can do by transferring the user to another agent who will collect the required information.
If you do, assume the other agent has all necessary information about the customer and their order.
You do not need to ask the user for more information.`;

  private readonly CATEGORIZATION_SYSTEM_TEMPLATE = 
    `Your job is to detect whether a billing support representative wants to refund the user.`;

  private getCategoricationHumanTemplate(billingRepResponseText: string): string {
    return `The following text is a response from a customer support representative.
Extract whether they want to refund the user or not.
Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:

If they want to refund the user, respond only with the word "REFUND".
Otherwise, respond only with the word "RESPOND".

Here is the text:

<text>
${billingRepResponseText}
</text>.`;
  }

  async handle(state: StateType): Promise<{ type: string; content: string }> {
    const trimmedHistory = this.trimHistory(state.messages);

    const billingRepResponse = await this.model.invoke([
      { role: "system", content: this.SYSTEM_TEMPLATE },
      ...trimmedHistory,
    ]);

    const categorizationResponse = await this.model.invoke([
      { role: "system", content: this.CATEGORIZATION_SYSTEM_TEMPLATE },
      { role: "user", content: this.getCategoricationHumanTemplate(billingRepResponse.content.toString()) }
    ], {
      response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
          z.object({
            nextRepresentative: z.enum(["REFUND", "RESPOND"]),
          })
        )
      }
    });
    
    return {
      type: "billing_response",
      content: categorizationResponse.content.toString(),
    };
  }
}
