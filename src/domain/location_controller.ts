import { FastifyReply, FastifyRequest } from "fastify";

export async function getLocationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.debug("search location");
  // get lat and lng
  // get PlaceData from lat and lng
  //
  // get venues near the location
  //
  // get top performers at those venues
  //
  // get top genres at those venues

  reply.send({
    venues: [],
    performers: [],
    genres: [],
  });
}
