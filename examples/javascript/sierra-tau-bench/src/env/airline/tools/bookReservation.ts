import { DataSchema } from '../dataSchema/DataSchema';
import { Reservation } from '../dataSchema/types';
import { Tool } from '../../../tool';
import { z } from 'zod';

const FlightInputSchema = z.object({
  flight_number: z.string(),
  date: z.string()
});

const PassengerInputSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  dob: z.string()
});

const PaymentMethodInputSchema = z.object({
  payment_id: z.string(),
  amount: z.number()
});

const BookReservationParamsSchema = z.object({
  userId: z.string(),
  origin: z.string(),
  destination: z.string(),
  flightType: z.enum(['one_way', 'round_trip']),
  cabin: z.enum(['basic_economy', 'economy', 'business']),
  flights: z.array(FlightInputSchema),
  passengers: z.array(PassengerInputSchema),
  paymentMethods: z.array(PaymentMethodInputSchema),
  totalBaggages: z.number(),
  nonfreeBaggages: z.number(),
  insurance: z.enum(['yes', 'no'])
});

type BookReservationParams = z.infer<typeof BookReservationParamsSchema>;

export class BookReservation extends Tool<BookReservationParams> {
  name = 'BookReservation';
  description = 'Book a new flight reservation';
  paramsSchema = BookReservationParamsSchema;

  _invoke(
    dataSchema: DataSchema,
    params: BookReservationParams
  ): string {
    const users = dataSchema.getAllUsers();
    const reservations = dataSchema.getAllReservations();

    // Check if user exists
    if (!(params.userId in users)) {
      return "Error: user not found";
    }
    const user = users[params.userId];

    // Generate reservation ID
    let reservationId = "HATHAT";
    if (reservationId in reservations) {
      reservationId = "HATHAU";
      if (reservationId in reservations) {
        reservationId = "HATHAV";
      }
    }

    // Create reservation object
    const reservation: Reservation = {
      reservation_id: reservationId,
      user_id: params.userId,
      origin: params.origin,
      destination: params.destination,
      flight_type: params.flightType,
      cabin: params.cabin,
      flights: [],
      passengers: params.passengers,
      payment_history: params.paymentMethods,
      created_at: new Date().toISOString(),
      total_baggages: params.totalBaggages,
      nonfree_baggages: params.nonfreeBaggages,
      insurance: params.insurance,
      status: 'active'
    };

    // Calculate total price and validate flights
    let totalPrice = 0;
    for (const flightInput of params.flights) {
      const flight = dataSchema.getFlight(flightInput.flight_number);
      if (!flight) {
        return `Error: flight ${flightInput.flight_number} not found`;
      }

      const flightDate = flight.dates[flightInput.date];
      if (!flightDate) {
        return `Error: flight ${flightInput.flight_number} not found on date ${flightInput.date}`;
      }

      if (flightDate.status !== 'available') {
        return `Error: flight ${flightInput.flight_number} not available on date ${flightInput.date}`;
      }

      if ('available_seats' in flightDate && flightDate.available_seats[params.cabin] < params.passengers.length) {
        return `Error: not enough seats on flight ${flightInput.flight_number}`;
      }

      const price = 'prices' in flightDate ? flightDate.prices[params.cabin] : 0;
      reservation.flights.push({
        flight_number: flightInput.flight_number,
        date: flightInput.date,
        origin: flight.origin,
        destination: flight.destination,
        price
      });
      totalPrice += price * params.passengers.length;
    }

    // Add insurance cost if needed
    if (params.insurance === 'yes') {
      totalPrice += 30 * params.passengers.length;
    }

    // Add baggage cost
    totalPrice += 50 * params.nonfreeBaggages;

    // Validate payment methods
    for (const payment of params.paymentMethods) {
      const paymentMethod = user.payment_methods[payment.payment_id];
      if (!paymentMethod) {
        return `Error: payment method ${payment.payment_id} not found`;
      }
      if (paymentMethod.source === 'certificate') {
        if (paymentMethod.amount < payment.amount) {
          return `Error: not enough balance in payment method ${payment.payment_id}`;
        }
      }
    }

    const totalPaid = params.paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid !== totalPrice) {
      return `Error: payment amount does not add up, total price is ${totalPrice}, but paid ${totalPaid}`;
    }

    // Process payments
    for (const payment of params.paymentMethods) {
      const paymentMethod = user.payment_methods[payment.payment_id];
      if (paymentMethod.source === 'certificate') {
        delete user.payment_methods[payment.payment_id];
      }
    }

    // Update data
    dataSchema.setReservation(reservationId, reservation);
    user.reservations.push(reservationId);
    dataSchema.setUser(params.userId, user);

    return JSON.stringify(reservation);
  }
}