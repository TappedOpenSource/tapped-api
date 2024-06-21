import { FastifyReply, FastifyRequest } from "fastify";
import { verifyApiKey } from "../data/auth";

declare module "fastify" {
  export interface FastifyRequest {
    userId?: string;
  }
}

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const apiKey = request.headers["x-api-key"];
    if (!apiKey) {
      request.log.error("missing API key");
      throw new Error("missing API key");
    }

    if (typeof apiKey !== "string") {
      request.log.error("invalid API key");
      throw new Error("invalid API key");
    }

    const { verified, userId } = await verifyApiKey(apiKey);
    if (!verified) {
      request.log.error("invalid API key");
      throw new Error("invalid API key");
    }

    request.log.info(`authenticated as ${userId}`);

    request.userId = userId;
  } catch (error) {
    request.log.error(error);
    reply.status(401).send({ message: "access denied" });
  }
}