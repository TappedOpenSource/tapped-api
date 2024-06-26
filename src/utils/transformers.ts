import { Booking, GuardedBooking } from "../types/booking";
import { GuardedReview, Review } from "../types/review";
import {
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

export function transformUser({
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

export function transformBooking(booking: Booking): GuardedBooking {
  return {
    id: booking.id,
    title: booking.name,
    description: booking.note,
    bookerId: booking.requesterId ?? null,
    performerId: booking.requesteeId,
    rate: booking.rate,
    location: {
      lat: booking.location.lat,
      lng: booking.location.lng,
    },
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    flierUrl: booking.flierUrl,
    eventUrl: booking.eventUrl,
    venueId: booking.venueId,
    referenceEventId: booking.referenceEventId,
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
