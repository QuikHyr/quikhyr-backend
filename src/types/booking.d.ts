import { Timestamp } from "firebase-admin/firestore";
import { Timestamps } from "./global";

export interface Booking {
  // id: string;
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
