import { Timestamp } from "firebase-admin/firestore";
import { Timestamps } from "./global";

export interface CategorizedBookings {
  currentBookings: Booking[];
  pastBookings: Booking[];
}

export interface Booking {
  clientId: string;
  workerId: string;
  subserviceId: string;
  dateTime: Timestamp;
  ratePerUnit: number;
  unit: string;
  status: "Pending" | "Completed" | "Not Completed";
  location: Location;
  timestamps: Timestamps;
}
