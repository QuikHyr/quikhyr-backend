import { Timestamps } from "./global";

export interface Subservice {
  serviceId: string;
  serviceName: string;
  name: string;
  description: string;
  tags: string[];
  // workers: string[];
}
