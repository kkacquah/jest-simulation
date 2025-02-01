import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const UpdateReservationBaggagesParamsSchema = z.object({
  reservationId: z.string().describe('The reservation id to update'),
  totalBaggages: z.number().min(0).describe('Total number of baggages'),
  nonfreeBaggages: z.number().min(0).describe('Number of non-free baggages'),
  paymentId: z.string().describe('The payment id stored in user profile')
});

type UpdateReservationBaggagesParams = z.infer<typeof UpdateReservationBaggagesParamsSchema>;

export class UpdateReservationBaggages extends Tool<UpdateReservationBaggagesParams> {
  name = 'UpdateReservationBaggages';
  description = 'Update baggage information for a reservation';
  paramsSchema = UpdateReservationBaggagesParamsSchema;

  _invoke(dataSchema: DataSchema, params: UpdateReservationBaggagesParams): string {
    const reservation = dataSchema.getReservation(params.reservationId);

    if (!reservation) {
      return "Error: reservation not found";
    }

    const totalPrice = 50 * Math.max(0, params.nonfreeBaggages - reservation.nonfree_baggages);
    if (!(params.paymentId in dataSchema.getUserOrThrow(reservation.user_id).payment_methods)) {
      return "Error: payment method not found";
    }
    const paymentMethod = dataSchema.getUserOrThrow(reservation.user_id).payment_methods[params.paymentId];
    if (paymentMethod.source === "certificate") {
      return "Error: certificate cannot be used to update reservation";
    } else if (
      paymentMethod.source === "gift_card" &&
      paymentMethod.amount < totalPrice
    ) {
      return "Error: gift card balance is not enough";
    }

    reservation.total_baggages = params.totalBaggages;
    reservation.nonfree_baggages = params.nonfreeBaggages;
    if (paymentMethod.source === "gift_card") {
      paymentMethod.amount -= totalPrice;
    }

    if (totalPrice !== 0) {
      reservation.payment_history.push({
        payment_id: params.paymentId,
        amount: totalPrice,
      });
    }

    dataSchema.setReservation(params.reservationId, reservation);

    return JSON.stringify(reservation);
  }
}