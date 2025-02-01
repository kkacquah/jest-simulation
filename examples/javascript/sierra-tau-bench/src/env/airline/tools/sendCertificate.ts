import { z } from 'zod';
import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';

const SendCertificateParamsSchema = z.object({
  userId: z.string().describe('The user id to send the certificate to'),
  amount: z.number().positive().describe('The amount of the certificate'),
  certificateId: z.string().describe('The id of the certificate')
});

type SendCertificateParams = z.infer<typeof SendCertificateParamsSchema>;

export class SendCertificate extends Tool<SendCertificateParams> {
  name = 'SendCertificate';
  description = 'Send a certificate to a user';
  paramsSchema = SendCertificateParamsSchema;

  _invoke(dataSchema: DataSchema, params: SendCertificateParams): string {
    const { userId, amount, certificateId } = params;
    const user = dataSchema.getUser(userId);

    if (!user) {
      return "Error: user not found";
    }

    user.payment_methods[certificateId] = {
      source: "certificate",
      amount: amount,
      id: certificateId
    };

    dataSchema.setUser(userId, user);

    return JSON.stringify({
      certificate_id: certificateId,
      amount: amount
    });
  }
}