import { Timestamp } from "firebase-admin/firestore";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Timestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
