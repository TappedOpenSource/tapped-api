import { FastifyReply, FastifyRequest } from "fastify";
import { queryUsers } from "../data/search";
import { GuardedPerformer } from "../types/user_model";
import { transformUser } from "../utils/guarded_user";

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
    const performers: GuardedPerformer[] = hits.map((user) => {
      return transformUser(user);
    });

    reply.send({
      performers,
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "internal server error" });
  }
}
