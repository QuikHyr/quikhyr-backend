import { Timestamps } from "./global";

export interface Subservice {
  name: string;
  image: string;
  description: string;
  tags: string[];
  serviceId: string;
  workers: string[];
}
