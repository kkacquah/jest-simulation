import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { z } from 'zod';

const FlightUpdateSchema = z.object({
  flight_number: z.string().describe('Flight number, such as \'HAT001\''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  price: z.number().optional(),
  origin: z.string().optional(),
  destination: z.string().optional()
});

const UpdateReservationFlightsParamsSchema = z.object({
  reservationId: z.string().describe('The reservation ID, such as \'ZFA04Y\''),
  cabin: z.enum(['basic_economy', 'economy', 'business']),
  flights: z.array(FlightUpdateSchema).describe('An array of objects containing details about each piece of flight in the ENTIRE new reservation. Even if the a flight segment is not changed, it should still be included in the array.'),
  paymentId: z.string().describe('The payment id stored in user profile, such as \'credit_card_7815826\', \'gift_card_7815826\', \'certificate_7815826\'')
});

type UpdateReservationFlightsParams = z.infer<typeof UpdateReservationFlightsParamsSchema>;

export class UpdateReservationFlights extends Tool<UpdateReservationFlightsParams> {
  name = 'UpdateReservationFlights';
  description = 'Update the flight information of a reservation.';
  paramsSchema = UpdateReservationFlightsParamsSchema;

  _invoke(dataSchema: DataSchema, params: UpdateReservationFlightsParams): string {
    const reservation = dataSchema.getReservation(params.reservationId);
    const users = dataSchema.getAllUsers();
    const reservations = dataSchema.getAllReservations();
    const flightsData = dataSchema.getAllFlights();

    if (!reservation) {
      return "Error: reservation not found";
    }

    // update flights and calculate price
    let totalPrice = 0;
    const updatedFlights = params.flights.map(flight => {
      if (!flight.origin || !flight.destination || !flight.price) {
        throw new Error(`Flight ${flight.flight_number} is missing required properties (origin, destination, or price)`);
      }
      return {
        flight_number: flight.flight_number,
        date: flight.date,
        price: flight.price,
        origin: flight.origin,
        destination: flight.destination
      };
    });

    for (const flight of updatedFlights) {
      // if existing flight, ignore
      const existingFlight = reservation.flights.find(
        f => f.flight_number === flight.flight_number &&
            f.date === flight.date &&
            params.cabin === reservation.cabin
      );

      if (existingFlight) {
        totalPrice += existingFlight.price * reservation.passengers.length;
        continue;
      }

      const flightNumber = flight.flight_number;
      if (!(flightNumber in flightsData)) {
        return `Error: flight ${flightNumber} not found`;
      }

      const flightData = flightsData[flightNumber];
      if (!(flight.date in flightData.dates)) {
        return `Error: flight ${flightNumber} not found on date ${flight.date}`;
      }

      const flightDateData = flightData.dates[flight.date];
      if (flightDateData.status !== "available") {
        return `Error: flight ${flightNumber} not available on date ${flight.date}`;
      }

      if (flightDateData.available_seats[params.cabin] < reservation.passengers.length) {
        return `Error: not enough seats on flight ${flightNumber}`;
      }

      totalPrice += flight.price * reservation.passengers.length;
    }

    totalPrice -= reservation.flights.reduce((sum, flight) => 
      sum + flight.price * reservation.passengers.length, 0
    );

    // check payment
    if (!(params.paymentId in users[reservation.user_id].payment_methods)) {
      return "Error: payment method not found";
    }

    const paymentMethod = users[reservation.user_id].payment_methods[params.paymentId];
    if (paymentMethod.source === "certificate") {
      return "Error: certificate cannot be used to update reservation";
    } else if (
      paymentMethod.source === "gift_card" &&
      paymentMethod.amount < totalPrice
    ) {
      return "Error: gift card balance is not enough";
    }

    // if checks pass, deduct payment and update seats
    if (paymentMethod.source === "gift_card") {
      paymentMethod.amount -= totalPrice;
    }

    reservation.flights = updatedFlights;
    if (totalPrice !== 0) {
      reservation.payment_history.push({
        payment_id: params.paymentId,
        amount: totalPrice,
      });
    }

    // Save changes
    dataSchema.setReservation(params.reservationId, reservation);

    return JSON.stringify(reservation);
  }
}