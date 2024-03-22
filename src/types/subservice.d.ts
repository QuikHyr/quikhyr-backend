import { Timestamps } from "./global";

export interface Subservice {
  name: string;
  description: string;
  tags: string[];
  serviceId: string;
  workers: string[];
}
