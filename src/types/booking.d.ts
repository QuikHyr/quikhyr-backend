import { Timestamp } from "firebase-admin/firestore";
import { Location, Timestamps } from "./global";

export interface CategorizedBookings {
  currentBookings: BookingInfo[];
  pastBookings: BookingInfo[];
}

export interface Booking extends BookingInfo {
  id?: string;
  clientId: string;
  workerId: string;
  subserviceId: string;
  location: Location;
  timestamps: Timestamps;
}

export interface BookingInfo {
  workerName: string;
  serviceName: string;
  subserviceName: string;
  serviceAvatar: string;
  locationName: string;
  dateTime: Timestamp;
  ratePerUnit: number;
  unit: string;
  status: "Pending" | "Completed" | "Not Completed";
}
