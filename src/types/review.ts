export type Review = {
  id: string;
  bookerId: string;
  performerId: string;
  bookingId: string;
  timestamp: Date;
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
