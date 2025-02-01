import { Tool } from '../../../tool';
import { DataSchema } from '../dataSchema/DataSchema';
import { Flight, FlightDateAvailable } from '../dataSchema/types';
import { z } from 'zod';

const SearchDirectFlightParamsSchema = z.object({
  origin: z.string().describe('Origin airport code'),
  destination: z.string().describe('Destination airport code'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

type SearchDirectFlightParams = z.infer<typeof SearchDirectFlightParamsSchema>;

export class SearchDirectFlight extends Tool<SearchDirectFlightParams> {
  name = 'SearchDirectFlight';
  description = 'Search for direct flights between two airports on a specific date';
  paramsSchema = SearchDirectFlightParamsSchema;

  _invoke(dataSchema: DataSchema, params: SearchDirectFlightParams): string {
    const flights = dataSchema.getAllFlights();
    const results: Partial<Flight & FlightDateAvailable>[] = [];

    for (const [_, flight] of Object.entries(flights)) {
      if (flight.origin === params.origin && flight.destination === params.destination) {
        const flightDate = flight.dates[params.date];
        if (flightDate && flightDate.status === 'available') {
          // Create result object without dates field
          const result = Object.entries(flight).reduce((acc, [key, value]) => {
            if (key !== 'dates') {
              acc[key as keyof Flight] = value;
            }
            return acc;
          }, {} as Partial<Flight>);

          // Add flight date information
          Object.assign(result, flightDate);
          results.push(result);
        }
      }
    }

    return JSON.stringify(results);
  }
}