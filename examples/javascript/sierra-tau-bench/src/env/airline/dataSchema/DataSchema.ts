import { createHash } from 'crypto';
import { Flight, User, Reservation } from './types';
import * as fs from 'fs';
import * as path from 'path';

export class DataSchema {
  private users: Record<string, User> = {};
  private flights: Record<string, Flight> = {};
  private reservations: Record<string, Reservation> = {};
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.loadData();
  }

  private loadData() {
    // Load all JSON files
    const usersPath = path.join(this.dataDir, 'users.json');
    const flightsPath = path.join(this.dataDir, 'flights.json');
    const reservationsPath = path.join(this.dataDir, 'reservations.json');

    this.users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    this.flights = JSON.parse(fs.readFileSync(flightsPath, 'utf-8'));
    this.reservations = JSON.parse(fs.readFileSync(reservationsPath, 'utf-8'));
  }

  // Methods to get data that may return undefined
  getUser(userId: string): User | undefined {
    return this.users[userId];
  }

  getFlight(flightNumber: string): Flight | undefined {
    return this.flights[flightNumber];
  }

  getReservation(reservationId: string): Reservation | undefined {
    return this.reservations[reservationId];
  }

  // Methods that throw if data not found
  getUserOrThrow(userId: string): User {
    const user = this.getUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  getFlightOrThrow(flightNumber: string): Flight {
    const flight = this.getFlight(flightNumber);
    if (!flight) {
      throw new Error(`Flight not found: ${flightNumber}`);
    }
    return flight;
  }

  getReservationOrThrow(reservationId: string): Reservation {
    const reservation = this.getReservation(reservationId);
    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`);
    }
    return reservation;
  }

  // Methods to update data
  updateUser(userId: string, userData: User) {
    this.users[userId] = userData;
  }

  updateFlight(flightNumber: string, flightData: Flight) {
    this.flights[flightNumber] = flightData;
  }

  updateReservation(reservationId: string, reservationData: Reservation) {
    this.reservations[reservationId] = reservationData;
  }

  // Set methods (aliases for update methods)
  setUser(userId: string, userData: User) {
    this.users[userId] = userData;
  }

  setReservation(reservationId: string, reservationData: Reservation) {
    this.reservations[reservationId] = reservationData;
  }

  // Get all data
  getAllUsers(): Record<string, User> {
    return { ...this.users };
  }

  getAllFlights(): Record<string, Flight> {
    return { ...this.flights };
  }

  getAllReservations(): Record<string, Reservation> {
    return { ...this.reservations };
  }

  // Generate hash of all data
  getDataHash(): string {
    const allData = {
      users: this.users,
      flights: this.flights,
      reservations: this.reservations
    };

    return createHash('sha256')
      .update(JSON.stringify(allData))
      .digest('hex');
  }
}

// Create a singleton instance
let instance: DataSchema | null = null;

export function getDataSchema(dataDir: string): DataSchema {
  if (!instance) {
    instance = new DataSchema(dataDir);
  }
  return instance;
}