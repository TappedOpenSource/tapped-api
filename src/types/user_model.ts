import { Timestamp } from "firebase-admin/firestore";
import { Option } from "./option";

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
  
export type PerformerInfo = {
    pressKitUrl?: Option<string>;
    genres: string[];
    rating?: Option<number>;
    reviewCount: number;
    label: string;
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

export type GuardedUserModel = {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    profilePicture: Option<string>;
    location: Option<Location>;
    socialFollowing: SocialFollowing;
    pressKitUrl?: Option<string>;
    genres: string[];
    spotifyId?: Option<string>;
  };