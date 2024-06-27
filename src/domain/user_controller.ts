import { FastifyReply, FastifyRequest } from "fastify";
import {
  getBookingsByRequesteeId,
  getPerformerReviewsByUserId,
  getUserById,
  getUserByUsername,
} from "../data/database";
import {
  transformBooking,
  transformReview,
  transformUser,
} from "../utils/transformers";

export async function getUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { performerId } = request.params as { performerId: string };
  const { datasource } = request.query as { datasource: string | undefined };
  request.log.info(`search performer id ${performerId} from ${datasource}`);

  if (!performerId) {
    request.log.error("id missing");
    reply.code(400).send({ error: "id is required" });
    return;
  }

  const user = await getUserById(performerId);
  if (!user) {
    request.log.error(`performer with id ${performerId} not found`);
    reply.code(404).send({ error: "performer not found" });
    return;
  }

  const bookings = await getBookingsByRequesteeId(user.id);
  const reviews = await getPerformerReviewsByUserId(user.id);

  const guardedUser = transformUser({
    user,
    bookings: bookings.map(transformBooking),
    reviews: reviews.map(transformReview),
  });

  reply.send({
    performer: guardedUser,
  });
}

export async function getUsernameController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { username } = request.params as { username: string };
  const { datasource } = request.query as { datasource: string | undefined };
  request.log.info(`search performer username ${username} from ${datasource}`);

  if (!username) {
    request.log.error("id missing");
    reply.code(400).send({ error: "id is required" });
    return;
  }

  const user = await getUserByUsername(username);
  if (!user) {
    request.log.error(`performer with username ${username} not found`);
    reply.code(404).send({ error: "performer not found" });
    return;
  }

  const bookings = await getBookingsByRequesteeId(user.id);
  const reviews = await getPerformerReviewsByUserId(user.id);

  const guardedUser = transformUser({
    user,
    bookings: bookings.map(transformBooking),
    reviews: reviews.map(transformReview),
  });

  reply.send({
    performer: guardedUser,
  });
}
