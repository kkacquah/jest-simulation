import { DataSchema } from '../dataSchema/DataSchema';
import { Tool } from '../../../tool';
import { Flight, FlightDateAvailable } from '../dataSchema/types';
import { z } from 'zod';

type FlightResult = Partial<Flight & FlightDateAvailable> & { date: string };

const SearchOneStopFlightParamsSchema = z.object({
  origin: z.string().describe('Origin airport code'),
  destination: z.string().describe('Destination airport code'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

type SearchOneStopFlightParams = z.infer<typeof SearchOneStopFlightParamsSchema>;

export class SearchOneStopFlight extends Tool<SearchOneStopFlightParams> {
  name = 'SearchOneStopFlight';
  description = 'Search for one-stop flights between two airports on a specific date';
  paramsSchema = SearchOneStopFlightParamsSchema;

  _invoke(dataSchema: DataSchema, params: SearchOneStopFlightParams): string {
    const flights = dataSchema.getAllFlights();
    const results: [FlightResult, FlightResult][] = [];

    for (const flight1 of Object.values(flights)) {
      if (flight1.origin === params.origin) {
        for (const flight2 of Object.values(flights)) {
          if (
            flight2.destination === params.destination &&
            flight1.destination === flight2.origin
          ) {
            // Calculate date2 based on arrival time
            const date2 = flight1.scheduled_arrival_time_est.includes('+1')
              ? `2024-05-${String(parseInt(params.date.slice(-2)) + 1).padStart(2, '0')}`
              : params.date;

            // Check if departure is after arrival
            if (flight1.scheduled_arrival_time_est > flight2.scheduled_departure_time_est) {
              continue;
            }

            const flight1Date = flight1.dates[params.date];
            if (!flight1Date || flight1Date.status !== 'available') continue;

            const result1: FlightResult = {
              flight_number: flight1.flight_number,
              date: params.date,  // Use the date parameter directly
              origin: flight1.origin,
              destination: flight1.destination,
              scheduled_departure_time_est: flight1.scheduled_departure_time_est,
              scheduled_arrival_time_est: flight1.scheduled_arrival_time_est,
              available_seats: flight1Date.available_seats,
              prices: flight1Date.prices,
              status: flight1Date.status
            };

            const flight2Date = flight2.dates[date2];
            if (!flight2Date || flight2Date.status !== 'available') continue;

            const result2: FlightResult = {
              flight_number: flight2.flight_number,
              date: date2,  // Use the date2 variable
              origin: flight2.origin,
              destination: flight2.destination,
              scheduled_departure_time_est: flight2.scheduled_departure_time_est,
              scheduled_arrival_time_est: flight2.scheduled_arrival_time_est,
              available_seats: flight2Date.available_seats,
              prices: flight2Date.prices,
              status: flight2Date.status
            };

            results.push([result1, result2]);
          }
        }
      }
    }

    return JSON.stringify(results);
  }
}