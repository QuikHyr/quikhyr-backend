import { Timestamps } from "./global";

export interface Subservice {
  // id: string;
  name: string;
  image: string;
  description: string;
  tags: string[];
  serviceId: string;
  workers: string[];
  // timestamps: Timestamps;
}
