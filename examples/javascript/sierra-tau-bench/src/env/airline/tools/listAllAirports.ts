// Copyright Sierra

import { Tool } from '../../../tool';
import { z } from 'zod';

// Since this tool doesn't need any parameters, we use an empty object schema
const ListAllAirportsParamsSchema = z.object({});

type ListAllAirportsParams = z.infer<typeof ListAllAirportsParamsSchema>;

export class ListAllAirports extends Tool<ListAllAirportsParams> {
  name = 'ListAllAirports';
  description = 'List all available airports';
  paramsSchema = ListAllAirportsParamsSchema;

  _invoke(dataSchema: any, params: ListAllAirportsParams): string {
    const airports = [
      "SFO",
      "JFK",
      "LAX",
      "ORD",
      "DFW",
      "DEN",
      "SEA",
      "ATL",
      "MIA",
      "BOS",
      "PHX",
      "IAH",
      "LAS",
      "MCO",
      "EWR",
      "CLT",
      "MSP",
      "DTW",
      "PHL",
      "LGA",
    ];

    const cities = [
      "San Francisco",
      "New York",
      "Los Angeles",
      "Chicago",
      "Dallas",
      "Denver",
      "Seattle",
      "Atlanta",
      "Miami",
      "Boston",
      "Phoenix",
      "Houston",
      "Las Vegas",
      "Orlando",
      "Newark",
      "Charlotte",
      "Minneapolis",
      "Detroit",
      "Philadelphia",
      "LaGuardia",
    ];

    const result = airports.map((airport, index) => ({
      code: airport,
      city: cities[index],
    }));

    return JSON.stringify(result);
  }
}