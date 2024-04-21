import { Timestamp } from "firebase-admin/firestore";
import { Location, Timestamps } from "./global";

export interface Notification {
  id: string;
  senderId: string;
  receiverIds: string[];
  timestamps: Timestamps;
  type: "work-alert" | "work-approval-request" | "general";
}

export interface ImmediateWorkAlert extends Notification {
  workAlertId: string;
  subserviceId: string;
  description: string;
  images?: string[];
  location: Location;
  locationName: string;
}

export interface ImmediateWorkAlertRejection extends Notification {
  workAlertId: string;
}

export interface ImmediateWorkApprovalRequest extends ImmediateWorkAlert {
  workApprovalRequestId: string;
  dateTime: Timestamp | string;
  ratePerUnit: number;
  unit: string;
}

export interface ImmediateWorkRejection extends Notification {
  workAlertId: string;
  workApprovalRequestId: string;
}
