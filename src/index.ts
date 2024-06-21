import { configDotenv } from "dotenv";
configDotenv({
  path: ".env",
});

import Fastify, { FastifyRequest } from "fastify";
import { searchPerformersController } from "./domain/search_controller";
import { requireApiKey } from "./domain/auth";
import { tlogger } from "./utils/logger";
import rateLimit from "@fastify/rate-limit"

const port = parseInt(process.env.PORT || "3000");
const host = process.env.ADDRESS || "0.0.0.0";
const fastify = Fastify({
  logger: tlogger,
});

async function createServer(): Promise<void> {
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: async (req: FastifyRequest) => {
      const apiKey = req.headers["x-api-key"];

      return apiKey ? `rate-limit:${apiKey}` : "rate-limit:anonymous";
    },
  })
  fastify.setNotFoundHandler({
    preHandler: fastify.rateLimit({
      max: 8,
      timeWindow: 500
    }),
  }, function (request, reply) {
    reply.code(404).send({ hello: "world" })
  });

  fastify.get("/", async function handler() {
    return { status: "ok" };
  });

  fastify.get("/health", async function handler() {
    return { status: "ok" };
  });

  fastify.get("/version", async function handler() {
    return { version: "1.0.0" };
  });

  fastify.get("/v1/performer/search", {
    preHandler: requireApiKey,
    handler: searchPerformersController
  });

  fastify.get("/v1/performer", async function handler(request, reply) {
    const { id, datasource } = request.query as { id: string, datasource: string | undefined };
    request.log.info(`search performer id ${id} from ${datasource}`);

    if (!id) {
      request.log.error("id missing");
      reply.code(400);
      return { error: "id is required" };
    }

    return process.env;
  });
}

export async function startServer() {
  try {
    await createServer();
    await fastify.listen({
      host,
      port,
    });
  } catch (err) {
    fastify.log.error(err);
    return;
  }
}

if (require.main === module) {
  startServer().catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
}
