/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-var-requires */
import { configDotenv } from "dotenv";
configDotenv({
  path: ".env",
});

import rateLimit from "@fastify/rate-limit";
import Fastify, { FastifyRequest } from "fastify";
import { requireApiKey } from "./domain/auth";
import { getLocationController } from "./domain/location_controller";
import { searchPerformersController } from "./domain/search_controller";
import {
  getUserController,
  getUsernameController,
} from "./domain/user_controller";
import { tlogger } from "./utils/logger";

const port = parseInt(process.env.PORT || "3000");
const host = process.env.ADDRESS || "0.0.0.0";
const fastify = Fastify({
  logger: tlogger,
});

async function createServer(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await fastify.register(require("@fastify/swagger"), {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Tapped API swagger docs",
        description: "Tapped API swagger docs",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      tags: [
        { name: "user", description: "User related end-points" },
        { name: "code", description: "Code related end-points" },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            name: "apiKey",
            in: "header",
          },
        },
      },
      externalDocs: {
        url: "https://api.tapped.ai/docs",
        description: "Find more info here",
      },
    },
  });
  await fastify.register(require("@fastify/swagger-ui"), {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });
  await fastify.register(require("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
    configuration: {
      spec: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        content: () => fastify.swagger(),
      },
    },
  });
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: async (req: FastifyRequest) => {
      const apiKey = req.headers["x-api-key"];

      return apiKey ? `rate-limit:${apiKey}` : "rate-limit:anonymous";
    },
  });
  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit({
        max: 8,
        timeWindow: 500,
      }),
    },
    function (request, reply) {
      reply.code(404).send({ hello: "world" });
    },
  );

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
    handler: searchPerformersController,
  });

  fastify.get("/v1/performer/:performerId", {
    preHandler: requireApiKey,
    handler: getUserController,
  });

  fastify.get("/v1/performer/username/:username", {
    preHandler: requireApiKey,
    handler: getUsernameController,
  });

  fastify.get("/v1/location/:lat-:lng", {
    preHandler: requireApiKey,
    handler: getLocationController,
  });
}

export async function startServer() {
  try {
    await createServer();
    await fastify.ready();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fastify.swagger();
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
