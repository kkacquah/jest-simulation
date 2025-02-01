import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const GetReservationDetailsParamsSchema = z.object({
  reservationId: z.string().describe('The reservation id, such as "8JX2WO"')
});

type GetReservationDetailsParams = z.infer<typeof GetReservationDetailsParamsSchema>;

export class GetReservationDetails extends Tool<GetReservationDetailsParams> {
  name = 'GetReservationDetails';
  description = 'Get the details of a reservation';
  paramsSchema = GetReservationDetailsParamsSchema;

  _invoke(
    dataSchema: DataSchema,
    params: GetReservationDetailsParams
  ): string {
    const reservation = dataSchema.getReservation(params.reservationId);

    if (!reservation) {
      return "Error: reservation not found";
    }

    return JSON.stringify(reservation);
  }
}