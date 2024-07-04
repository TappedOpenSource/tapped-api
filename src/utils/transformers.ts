import { Booking, GuardedBooking } from "../types/booking";
import { GuardedReview, Review } from "../types/review";
import {
  GuardedVenue,
  GuardedPerformer,
  ticketPriceRange,
  userAudienceSize,
  UserModel,
} from "../types/user_model";

type TranformParams = {
  user: UserModel;
  bookings: GuardedBooking[];
  reviews: GuardedReview[];
};

export function transformPerformer({
  user,
  bookings,
  reviews,
}: TranformParams): GuardedPerformer {
  const audience = userAudienceSize(user);
  const averageAttendance = Math.round(audience / 250);
  const category = user.performerInfo?.category ?? "undiscovered";
  const userTicketRange = ticketPriceRange(category);
  return {
    id: user.id,
    username: user.username,
    displayName: user.artistName,
    bio: user.bio,
    profilePictureUrl: user.profilePicture,
    location: user.location,
    socialFollowing: user.socialFollowing,
    genres: user.performerInfo?.genres ?? [],
    averageAttendance,
    averageTicketRange: {
      min: userTicketRange[0],
      max: userTicketRange[1],
    },
    ...user.performerInfo,
    bookings: {
      count: bookings.length,
      items: bookings,
    },
    reviews: {
      count: reviews.length,
      rating:
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length,
      items: reviews,
    },
  };
}

export function transformVenue({
  user,
  bookings,
  reviews,
}: TranformParams): GuardedVenue {
  return {
    id: user.id,
    username: user.username,
    displayName: user.artistName,
    profilePictureUrl: user.profilePicture,
    bio: user.bio,
    location: user.location,
    ...user.venueInfo,
    genres: user.venueInfo?.genres ?? [],
    topPerformerIds: user.venueInfo?.topPerformerIds ?? [],
    bookings: {
      count: bookings.length,
      items: bookings,
    },
    reviews: {
      count: reviews.length,
      rating:
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length,
      items: reviews,
    },
  };
}

export function transformBooking(booking: Booking): GuardedBooking {
  const bookingLocation =
    booking.location !== undefined
      ? {
        lat: booking.location.lat,
        lng: booking.location.lng,
      }
      : null;
  return {
    id: booking.id,
    title: booking.name ?? "",
    description: booking.note ?? "",
    bookerId: booking.requesterId ?? null,
    performerId: booking.requesteeId ?? null,
    rate: booking.rate ?? 0,
    location: bookingLocation,
    startTime: booking.startTime?.toDate().toISOString() ?? null,
    endTime: booking.endTime?.toDate().toISOString() ?? null,
    flierUrl: booking.flierUrl ?? null,
    eventUrl: booking.eventUrl ?? null,
    venueId: booking.venueId ?? null,
    referenceEventId: booking.referenceEventId ?? null,
  };
}

export function transformReview(review: Review): GuardedReview {
  return {
    id: review.id,
    performerId: review.performerId,
    bookerId: review.bookerId,
    bookingId: review.bookingId,
    rating: review.overallRating,
    text: review.overallReview,
  };
}
