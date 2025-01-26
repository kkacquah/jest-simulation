import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { SupportNode, StateType } from "./SupportNode";

export class InitialSupportNode extends SupportNode {

  private readonly SYSTEM_TEMPLATE = `You are frontline support staff for LangCorp, a company that sells computers.
Be concise in your responses.
You can chat with customers and help them with basic questions, but if the customer is having a billing or technical problem,
do not try to answer the question directly or gather information.
Instead, immediately transfer them to the billing or technical team by asking the user to hold for a moment.
Otherwise, just respond conversationally.`;

  private readonly CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
Your job is to detect whether a customer support representative is routing a user to a billing team or a technical team, or if they are just responding conversationally.`;

  private readonly CATEGORIZATION_HUMAN_TEMPLATE = `The previous conversation is an interaction between a customer support representative and a user.
Extract whether the representative is routing the user to a billing or technical team, or whether they are just responding conversationally.
Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:

If they want to route the user to the billing team, respond only with the word "BILLING".
If they want to route the user to the technical team, respond only with the word "TECHNICAL".
Otherwise, respond only with the word "RESPOND".`;

  async handle(state: StateType): Promise<{ messages: any[]; nextRepresentative: string }> {
    const supportResponse = await this.model.invoke([
      { role: "system", content: this.SYSTEM_TEMPLATE },
      ...state.messages,
    ]);

    const categorizationResponse = await this.model.invoke([
      { role: "system", content: this.CATEGORIZATION_SYSTEM_TEMPLATE },
      ...state.messages,
      { role: "user", content: this.CATEGORIZATION_HUMAN_TEMPLATE }
    ], {
      response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
          z.object({
            nextRepresentative: z.enum(["BILLING", "TECHNICAL", "RESPOND"]),
          })
        )
      }
    });

    const categorizationOutput = JSON.parse(categorizationResponse.content as string);
    return { 
      messages: [supportResponse], 
      nextRepresentative: categorizationOutput.nextRepresentative 
    };
  }

  async invoke(input: StateType): Promise<any> {
    return this.handle(input);
  }
}
