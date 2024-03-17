import { Location, Timestamps } from "./global";

export interface User {
  name: string;
  age?: number;
  avatar?: string;
  email: string;
  phone: string;
  gender?: string;
  location: Location;
  pincode: string;
  timestamps: Timestamps;
}

export interface UserBasicInfo {
  name: string;
  avatar?: string;
  pincode: string;
}
