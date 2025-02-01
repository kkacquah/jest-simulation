import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const PassengerInputSchema = z.object({
  first_name: z.string().describe('First name of the passenger'),
  last_name: z.string().describe('Last name of the passenger'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').describe('Date of birth in YYYY-MM-DD format')
});

const UpdateReservationPassengersParamsSchema = z.object({
  reservationId: z.string().describe('The reservation id to update'),
  passengers: z.array(PassengerInputSchema).describe('Array of passenger information')
});

type UpdateReservationPassengersParams = z.infer<typeof UpdateReservationPassengersParamsSchema>;

export class UpdateReservationPassengers extends Tool<UpdateReservationPassengersParams> {
  name = 'UpdateReservationPassengers';
  description = 'Update passenger information for a reservation';
  paramsSchema = UpdateReservationPassengersParamsSchema;

  _invoke(dataSchema: DataSchema, params: UpdateReservationPassengersParams): string {
    const reservation = dataSchema.getReservation(params.reservationId);

    if (!reservation) {
      return "Error: reservation not found";
    }

    // Update passenger information
    reservation.passengers = params.passengers.map(p => ({
      first_name: p.first_name,
      last_name: p.last_name,
      dob: p.dob
    }));

    // Save changes
    dataSchema.setReservation(params.reservationId, reservation);

    return JSON.stringify(reservation);
  }
}