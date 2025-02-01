import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const CancelReservationParamsSchema = z.object({
  reservationId: z.string()
});

type CancelReservationParams = z.infer<typeof CancelReservationParamsSchema>;

export class CancelReservation extends Tool<CancelReservationParams> {
  name = 'CancelReservation';
  description = 'Cancel a reservation';
  paramsSchema = CancelReservationParamsSchema;

  _invoke(dataSchema: DataSchema, params: CancelReservationParams): string {
    const reservation = dataSchema.getReservation(params.reservationId);

    if (!reservation) {
      return "Error: reservation not found";
    }

    // Update reservation status
    reservation.status = 'cancelled';
    dataSchema.setReservation(params.reservationId, reservation);

    return JSON.stringify(reservation);
  }
}