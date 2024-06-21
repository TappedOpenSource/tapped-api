import { FastifyReply, FastifyRequest } from "fastify";
import { queryUsers } from "../data/search";
import { GuardedUserModel } from "../types/user_model";

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
    const performers: GuardedUserModel[] = hits.map((user) => {
      return {
        id: user.id,
        username: user.username,
        displayName: user.artistName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        location: user.location,
        socialFollowing: user.socialFollowing,
        genres: user.performerInfo?.genres ?? [],
        ...user.performerInfo,
      };
    });

    reply.send({
      performers,
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "internal server error" });
  }
}