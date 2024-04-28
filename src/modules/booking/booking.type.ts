import { Timestamp } from "firebase-admin/firestore";
import { Location, Timestamps } from "../../global";

export interface CategorizedBookings {
  currentBookings: Partial<Booking>[];
  pastBookings: Partial<Booking>[];
}

export interface Booking {
  id: string;
  clientId: string;
  workerId: string;
  subserviceId: string;
  clientName: string;
  workerName: string;
  serviceName: string;
  subserviceName: string;
  serviceAvatar: string;
  locationName: string;
  dateTime: Timestamp | string;
  ratePerUnit: number;
  unit: string;
  status: "Pending" | "Completed" | "Not Completed";
  location: Location;
  timestamps: Timestamps;
}
