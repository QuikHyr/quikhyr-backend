import { Location, Timestamps } from "./global";

export interface Client {
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

export interface ClientBasicInfo {
  name: string;
  avatar?: string;
  pincode: string;
}
