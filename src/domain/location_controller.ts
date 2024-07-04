import { FastifyReply, FastifyRequest } from "fastify";
import {
  getBookerReviewsByUserId,
  getBookingsByRequesterId,
  getUserById,
} from "../data/database";
import { queryUsers } from "../data/search";
import { UserModel } from "../types/user_model";
import { normalizeRecord } from "../utils/normalize";
import {
  transformBooking,
  transformReview,
  transformVenue,
} from "../utils/transformers";

export async function getLocationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.debug("search location");

  // get lat and lng
  const { lat, lng } = request.params as { lat: string; lng: string };
  request.log.info(`search location ${lat}, ${lng}`);

  let latNum: number;
  let lngNum: number;
  try {
    latNum = parseFloat(lat);
    lngNum = parseFloat(lng);
  } catch (error) {
    request.log.error(error);
    reply.code(400).send({ error: "invalid lat/lng" });
    return;
  }

  // get venues near the location
  const venues: UserModel[] = await queryUsers(" ", {
    occupations: ["venue", "Venue"],
    lat: latNum,
    lng: lngNum,
    radius: 100_000,
    hitsPerPage: 250,
  });
  request.log.info(`found ${venues.length} venues`);

  const guardedVenues = await Promise.all(
    venues.map(async (v) => {
      const bookings = await getBookingsByRequesterId(v.id);
      const reviews = await getBookerReviewsByUserId(v.id);
      return transformVenue({
        user: v,
        bookings: bookings.map(transformBooking),
        reviews: reviews.map(transformReview),
      });
    }),
  );

  // get top performers at those venues
  const topPerformers = (await Promise.all(
    guardedVenues
      .flatMap((venue) => venue.topPerformerIds)
      .map(async (performerId) => {
        const performer = await getUserById(performerId);
        return performer;
      })
      .filter((performer) => {
        return performer !== null;
      }),
  )) as UserModel[];
  request.log.info(`found ${topPerformers.length} performers`);

  // get top genres at those venues
  const genres = guardedVenues
    .flatMap((venue) => venue.genres ?? [])
    .reduce(
      (acc, genre) => {
        acc[genre] = (acc[genre] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const normalizedGenres = normalizeRecord(genres);

  reply.send({
    venues: guardedVenues,
    topPerformers,
    genres: normalizedGenres,
  });
}
