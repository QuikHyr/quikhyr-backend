import { Timestamp } from "firebase-admin/firestore";
import { Timestamps } from "../../global";

export interface IndividualRating {
  rating: number;
  feedback?: string;
}

export interface Ratings {
  quality?: IndividualRating;
  efficiency?: IndividualRating;
  reliability?: IndividualRating;
  knowledge?: IndividualRating;
  value?: IndividualRating;
}

export interface Rating {
  clientId: string;
  workerId: string;
  bookingId: string;
  subserviceName: string;
  ratings?: Ratings;
  overallRating?: IndividualRating;
  timestamps: Timestamps;
}
