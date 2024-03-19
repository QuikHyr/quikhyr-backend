import { Location, Timestamps } from "./global";

export interface User {
  id: string;
  name: string;
  age?: number;
  avatar: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Rather Not Say";
  location: Location;
  pincode: string;
  timestamps: Timestamps;
}

export interface UserBasicInfo {
  name: string;
  avatar: string;
  pincode: string;
}
