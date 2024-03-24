import { Timestamp } from "firebase-admin/firestore";
import { Location, Timestamps } from "./global";

export interface User {
  id: string;
  fcmToken: string;
  name: string;
  age?: number;
  avatar: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Rather Not Say";
  location: Location;
  pincode: string;
  isVerified: boolean;
  lastOnline: Timestamp | string;
  isActive: boolean;
  timestamps: Timestamps;
}

export interface UserBasicInfo {
  name: string;
  avatar: string;
  pincode: string;
}
