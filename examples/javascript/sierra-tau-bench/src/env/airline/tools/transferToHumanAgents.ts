import { Tool } from '../../../tool';
import { z } from 'zod';

const TransferToHumanAgentsParamsSchema = z.object({
  summary: z.string().describe('A summary of the user\'s issue')
});

type TransferToHumanAgentsParams = z.infer<typeof TransferToHumanAgentsParamsSchema>;

export class TransferToHumanAgents extends Tool<TransferToHumanAgentsParams> {
  name = 'TransferToHumanAgents';
  description = 'Transfer the user to a human agent, with a summary of the user\'s issue. Only transfer if the user explicitly asks for a human agent, or if the user\'s issue cannot be resolved by the agent with the available tools.';
  paramsSchema = TransferToHumanAgentsParamsSchema;

  _invoke(_dataSchema: any, params: TransferToHumanAgentsParams): string {
    return "Transfer successful";
  }
}