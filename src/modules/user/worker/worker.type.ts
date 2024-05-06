import { User, UserBasicInfo } from "../user.type";

export interface Worker extends User {
  summary: string;
  available: boolean;
  serviceIds: string[];
  subserviceIds: string[];
  rating: number;
}

export interface WorkerBasicInfo extends UserBasicInfo {
  rating: number;
  subserviceName?: string;
}
