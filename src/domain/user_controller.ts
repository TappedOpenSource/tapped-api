import { FastifyRequest, FastifyReply } from "fastify";
import { transformUser } from "../utils/guarded_user";
import { getUserById } from "../data/database";

export async function getUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  const { id, datasource } = request.query as { id: string, datasource: string | undefined };
  request.log.info(`search performer id ${id} from ${datasource}`);

  if (!id) {
    request.log.error("id missing");
    reply.code(400).send({ error: "id is required" });
    return;
  }

  const user = await getUserById(id); 
  if (!user) {
    request.log.error(`performer with id ${id} not found`);
    reply.code(404).send({ error: "performer not found" });
    return;
  }

  const guardedUser = transformUser(user);

  reply.send({
    performer: guardedUser,
  });
}