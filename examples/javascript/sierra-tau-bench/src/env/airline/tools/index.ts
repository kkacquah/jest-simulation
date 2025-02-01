import { BookReservation } from './bookReservation';
import { Calculate } from './calculate';
import { CancelReservation } from './cancelReservation';
import { GetReservationDetails } from './getReservationDetails';
import { GetUserDetails } from './getUserDetails';
import { ListAllAirports } from './listAllAirports';
import { SearchDirectFlight } from './searchDirectFlight';
import { SearchOneStopFlight } from './searchOneStopFlight';
import { SendCertificate } from './sendCertificate';
import { Think } from './think';
import { TransferToHumanAgents } from './transferToHumanAgents';
import { UpdateReservationBaggages } from './updateReservationBaggages';
import { UpdateReservationFlights } from './updateReservationFlights';
import { UpdateReservationPassengers } from './updateReservationPassengers';
import { Tool } from '../../../tool';

export type ToolConstructor = new () => Tool<any>;

export const AllTools: ToolConstructor[] = [
    BookReservation,
    Calculate,
    CancelReservation,
    GetReservationDetails,
    GetUserDetails,
    ListAllAirports,
    SearchDirectFlight,
    SearchOneStopFlight,
    SendCertificate,
    Think,
    TransferToHumanAgents,
    UpdateReservationBaggages,
    UpdateReservationFlights,
    UpdateReservationPassengers
];
