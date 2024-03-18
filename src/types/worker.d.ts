import { Location, Timestamps } from "./global";
import { User, UserBasicInfo } from "./user";

export interface Worker extends User {
  available: boolean;
  subservices: string[];
}

export interface WorkerBasicInfo extends UserBasicInfo {
  available: boolean;
}
