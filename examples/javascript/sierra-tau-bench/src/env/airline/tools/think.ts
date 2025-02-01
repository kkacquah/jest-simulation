import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const ThinkParamsSchema = z.object({
  thought: z.string().describe('The thought to process')
});

type ThinkParams = z.infer<typeof ThinkParamsSchema>;

export class Think extends Tool<ThinkParams> {
  name = 'Think';
  description = 'Think about something and return the thought';
  paramsSchema = ThinkParamsSchema;

  _invoke(dataSchema: DataSchema, params: ThinkParams): string {
    return params.thought;
  }
}