import { FastifyReply, FastifyRequest } from "fastify";
import {
  getBookingsByRequesteeId,
  getPerformerReviewsByUserId,
} from "../data/database";
import { queryUsers } from "../data/search";
import { GuardedPerformer } from "../types/user_model";
import {
  transformBooking,
  transformReview,
  transformPerformer,
} from "../utils/transformers";

export async function searchPerformersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { q } = request.query as { q: string };
    request.log.info(`search query '${q}'`);

    const hits = await queryUsers(q, {
      hitsPerPage: 50,
      occupationsBlackList: ["venue", "Venue"],
    });

    request.log.info(`found ${hits.length} performers`);

    // transform UserModel to something to send to client
    const performers: GuardedPerformer[] = await Promise.all(
      hits.map(async (user) => {
        const bookings = await getBookingsByRequesteeId(user.id);
        const reviews = await getPerformerReviewsByUserId(user.id);

        return transformPerformer({
          user,
          bookings: bookings.map(transformBooking),
          reviews: reviews.map(transformReview),
        });
      }),
    );

    reply.send({
      performers,
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "internal server error" });
  }
}
