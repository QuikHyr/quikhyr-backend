import { Timestamps } from "./global";

export interface Subservice {
  serviceId: string;
  name: string;
  description: string;
  tags: string[];
  workers: string[];
}
