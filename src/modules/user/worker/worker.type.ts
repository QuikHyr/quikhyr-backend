import { Location, Timestamps } from "../../../global";
import { User, UserBasicInfo } from "../user.type";

export interface Worker extends User {
  summary: string;
  available: boolean;
  serviceIds: string[];
  subserviceIds: string[];
}

export interface WorkerBasicInfo extends UserBasicInfo {
  rating: number;
  subserviceName: string;
}

export interface WorkerInfo extends WorkerBasicInfo {
  available: boolean;
  ratePerUnit: number;
  unit: string;
  waitingList: number;
}
