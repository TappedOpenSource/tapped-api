import { Timestamp } from "firebase-admin/firestore";

export type Review = {
  id: string;
  bookerId: string;
  performerId: string;
  bookingId: string;
  timestamp: Timestamp;
  overallRating: number;
  overallReview: string;
  type: "performer" | "booker";
};

export type GuardedReview = {
  id: string;
  performerId: string;
  bookerId: string;
  bookingId: string;
  rating: number;
  text: string;
};
