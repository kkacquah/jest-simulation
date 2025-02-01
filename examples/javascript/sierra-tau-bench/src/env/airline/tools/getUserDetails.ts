import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const GetUserDetailsParamsSchema = z.object({
  userId: z.string().describe("The user id, such as 'sara_doe_496'")
});

type GetUserDetailsParams = z.infer<typeof GetUserDetailsParamsSchema>;

export class GetUserDetails extends Tool<GetUserDetailsParams> {
  name = 'GetUserDetails';
  description = 'Get the details of a user, including their reservations';
  paramsSchema = GetUserDetailsParamsSchema;

  _invoke(dataSchema: DataSchema, params: GetUserDetailsParams): string {
    const user = dataSchema.getUser(params.userId);

    if (!user) {
      return "Error: user not found";
    }

    return JSON.stringify(user);
  }
}