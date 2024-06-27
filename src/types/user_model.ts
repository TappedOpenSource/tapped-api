import { Timestamp } from "firebase-admin/firestore";
import { GuardedBooking } from "./booking";
import { Option } from "./option";
import { GuardedReview } from "./review";

export type Location = {
  placeId: string;
  lat: number;
  lng: number;
};

export type SocialFollowing = {
  youtubeChannelId?: Option<string>;
  tiktokHandle?: Option<string>;
  tiktokFollowers: number;
  instagramHandle?: Option<string>;
  instagramFollowers: number;
  twitterHandle?: Option<string>;
  twitterFollowers: number;
  facebookHandle?: Option<string>;
  facebookFollowers: number;
  spotifyUrl?: Option<string>;
  soundcloudHandle?: Option<string>;
  soundcloudFollowers: number;
  audiusHandle?: Option<string>;
  audiusFollowers: number;
  twitchHandle?: Option<string>;
  twitchFollowers: number;
};

export type BookerInfo = {
  rating?: Option<number>;
  reviewCount: number;
};

export type PerformerCategory =
  | "undiscovered"
  | "emerging"
  | "hometownHero"
  | "mainstream"
  | "legendary";

export type PerformerInfo = {
  pressKitUrl?: Option<string>;
  genres: string[];
  rating?: Option<number>;
  reviewCount: number;
  label: string;
  category: PerformerCategory;
  spotifyId?: Option<string>;
};

export type VenueInfo = {
  genres?: string[];
  bookingEmail?: Option<string>;
  autoReply?: Option<string>;
  capacity?: Option<number>;
  idealPerformerProfile?: Option<string>;
  productionInfo?: Option<string>;
  frontOfHouse?: Option<string>;
  monitors?: Option<string>;
  microphones?: Option<string>;
  lights?: Option<string>;
  topPerformerIds: string[];
};

export type EmailNotifications = {
  appReleases: boolean;
  tappedUpdates: boolean;
  bookingRequests: boolean;
};

export type PushNotifications = {
  appReleases: boolean;
  tappedUpdates: boolean;
  bookingRequests: boolean;
  directMessages: boolean;
};

export type UserModel = {
  id: string;
  email: string;
  unclaimed: boolean;
  timestamp: Timestamp;
  username: string;
  artistName: string;
  bio: string;
  occupations: string[];
  profilePicture: Option<string>;
  location: Option<Location>;
  performerInfo: Option<PerformerInfo>;
  venueInfo: Option<VenueInfo>;
  bookerInfo: Option<BookerInfo>;
  emailNotifications: EmailNotifications;
  pushNotifications: PushNotifications;
  deleted: boolean;
  socialFollowing: SocialFollowing;
  stripeConnectedAccountId: Option<string>;
  stripeCustomerId: Option<string>;
};

export type GuardedPerformer = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePictureUrl: Option<string>;
  location: Option<Location>;
  socialFollowing: SocialFollowing;
  pressKitUrl?: Option<string>;
  genres: string[];
  spotifyId?: Option<string>;
  averageTicketRange: {
    min: number;
    max: number;
  };
  averageAttendance: number;
  bookings: {
    count: number;
    items: GuardedBooking[];
  };
  reviews: {
    count: number;
    rating: number;
    items: GuardedReview[];
  };
};

export type GuardedVenue = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePictureUrl: Option<string>;
  location: Option<Location>;
  genres: string[];
  bookingEmail?: Option<string>;
  capacity?: Option<number>;
  idealPerformerProfile?: Option<string>;
  productionInfo?: Option<string>;
  frontOfHouse?: Option<string>;
  monitors?: Option<string>;
  microphones?: Option<string>;
  lights?: Option<string>;
  topPerformerIds: string[];
  bookings: {
    count: number;
    items: GuardedBooking[];
  };
  reviews: {
    rating: number;
    count: number;
    items: GuardedReview[];
  };
};

export const userAudienceSize = (user: UserModel): number =>
  totalSocialFollowing(user.socialFollowing);

export const totalSocialFollowing = (
  socialFollowing: SocialFollowing | null,
): number =>
  (socialFollowing?.twitterFollowers ?? 0) +
  (socialFollowing?.instagramFollowers ?? 0) +
  (socialFollowing?.tiktokFollowers ?? 0);

export function ticketPriceRange(
  category: PerformerCategory,
): [number, number] {
  switch (category) {
  case "undiscovered":
    return [0, 1000];
  case "emerging":
    return [1000, 2000];
  case "hometownHero":
    return [2000, 4000];
  case "mainstream":
    return [4000, 7500];
  case "legendary":
    return [7500, 100000];
  }
}
