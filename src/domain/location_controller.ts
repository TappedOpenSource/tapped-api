import { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from "../data/database";
import { queryUsers } from "../data/search";
import { UserModel } from "../types/user_model";
import { normalizeRecord } from "../utils/normalize";

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
    radius: 100,
    hitsPerPage: 250,
  });

  // get top performers at those venues
  const topPerformers = (await Promise.all(
    venues
      .flatMap((venue) => venue.venueInfo?.topPerformerIds ?? [])
      .map(async (performerId) => {
        const performer = await getUserById(performerId);
        return performer;
      })
      .filter((performer) => {
        return performer !== null;
      }),
  )) as UserModel[];

  // get top genres at those venues
  const genres = venues
    .flatMap((venue) => venue.venueInfo?.genres ?? [])
    .reduce(
      (acc, genre) => {
        acc[genre] = (acc[genre] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const normalizedGenres = normalizeRecord(genres);

  reply.send({
    venues,
    topPerformers,
    genres: normalizedGenres,
  });
}
