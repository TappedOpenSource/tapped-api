import { Option } from "./option";
import { Location } from "./user_model";

export type Booking = {
  id: string;
  serviceId: Option<string>;
  name: string;
  note: string;
  requesterId?: string | null;
  requesteeId: string;
  status: "pending" | "confirmed" | "canceled";
  rate: number;
  location: Location;
  startTime: Date;
  endTime: Date;
  timestamp: Date;
  flierUrl: Option<string>;
  eventUrl: Option<string>;
  venueId: Option<string>;
  referenceEventId: Option<string>;
};

export type GuardedBooking = {
  id: string;
  title: string;
  description: string;
  bookerId: Option<string>;
  performerId: string;
  rate: number;
  location: {
    lat: number;
    lng: number;
  };
  startTime: string;
  endTime: string;
  flierUrl: Option<string>;
  eventUrl: Option<string>;
  venueId: Option<string>;
  referenceEventId: Option<string>;
};
