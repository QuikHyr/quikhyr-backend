import { Location, Timestamps } from "../../global";

export interface User {
  id: string;
  fcmToken: string;
  name: string;
  age?: number;
  avatar: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other" | "Rather Not Say";
  location: Location;
  locationName: string;
  pincode: string;
  isVerified: boolean;
  isActive: boolean;
  timestamps: Timestamps;
}

export interface UserBasicInfo {
  name: string;
  avatar: string;
  pincode: string;
  isVerified: boolean;
}
