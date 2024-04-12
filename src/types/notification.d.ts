import { Timestamp } from "firebase-admin/firestore";
import { Timestamps } from "./global";

export interface Notification {
  senderId: string;
  receiverIds?: string[];
  timestamps: Timestamps;
}

export interface ImmediateWorkAlert extends Notification {
  subserviceId: string;
  description: string;
  images?: string[];
  location: Location;
  locationName: string;
}

export interface ImmediateWorkApprovalRequest extends ImmediateWorkAlert {
  dateTime: Timestamp;
  ratePerUnit: number;
  unit: string;
}
