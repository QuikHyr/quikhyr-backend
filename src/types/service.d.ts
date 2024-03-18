import { Timestamps } from "./global";

export interface Service {
  id: string;
  name: string;
  description: string;
  subservices: string[];
  timestamps: Timestamps;
}
