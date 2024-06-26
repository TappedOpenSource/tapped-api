import { FastifyReply, FastifyRequest } from "fastify";
import { getUserById, getUserByUsername } from "../data/database";
import { transformUser } from "../utils/guarded_user";

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

  const guardedUser = transformUser(user);

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

  const guardedUser = transformUser(user);

  reply.send({
    performer: guardedUser,
  });
}
