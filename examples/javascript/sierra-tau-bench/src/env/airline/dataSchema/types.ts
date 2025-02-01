// Flight Types
type CabinClass = 'basic_economy' | 'economy' | 'business';

type FlightStatus = 'landed' | 'cancelled' | 'available';

interface AvailableSeats {
  basic_economy: number;
  economy: number;
  business: number;
}

interface Prices {
  basic_economy: number;
  economy: number;
  business: number;
}

interface FlightDateLanded {
  status: 'landed';
  actual_departure_time_est: string;
  actual_arrival_time_est: string;
}

interface FlightDateCancelled {
  status: 'cancelled';
}

interface FlightDateAvailable {
  status: 'available';
  available_seats: AvailableSeats;
  prices: Prices;
}

type FlightDate = FlightDateLanded | FlightDateCancelled | FlightDateAvailable;

interface Flight {
  flight_number: string;
  origin: string;
  destination: string;
  scheduled_departure_time_est: string;
  scheduled_arrival_time_est: string;
  dates: Record<string, FlightDate>;
}

// User Types
interface Name {
  first_name: string;
  last_name: string;
}

interface Address {
  address1: string;
  address2?: string;
  city: string;
  country: string;
  state: string;
  zip: string;
}

interface CreditCard {
  source: 'credit_card';
  brand: string;
  last_four: string;
  id: string;
}

interface Certificate {
  source: 'certificate';
  amount: number;
  id: string;
}

interface GiftCard {
  source: 'gift_card';
  amount: number;
  id: string;
}

type PaymentMethod = CreditCard | Certificate | GiftCard;

interface SavedPassenger {
  first_name: string;
  last_name: string;
  dob: string;
}

interface User {
  name: Name;
  address: Address;
  email: string;
  dob: string;
  payment_methods: Record<string, PaymentMethod>;
  saved_passengers: SavedPassenger[];
  membership: 'gold' | 'silver' | 'bronze';
  reservations: string[];
}

// Reservation Types
type ReservationStatus = 'active' | 'cancelled';

interface ReservationFlight {
  origin: string;
  destination: string;
  flight_number: string;
  date: string;
  price: number;
}

interface PaymentHistory {
  payment_id: string;
  amount: number;
}

interface Reservation {
  reservation_id: string;
  user_id: string;
  origin: string;
  destination: string;
  flight_type: 'one_way' | 'round_trip';
  cabin: CabinClass;
  flights: ReservationFlight[];
  passengers: SavedPassenger[];
  payment_history: PaymentHistory[];
  created_at: string;
  total_baggages: number;
  nonfree_baggages: number;
  insurance: 'yes' | 'no';
  status: ReservationStatus;
}

// Export all types
export type {
  Flight,
  FlightDate,
  FlightStatus,
  CabinClass,
  User,
  PaymentMethod,
  SavedPassenger,
  Reservation,
  ReservationFlight,
  FlightDateAvailable,
};