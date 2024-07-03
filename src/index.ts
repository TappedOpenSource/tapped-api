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
          url: "https://api.tapped.ai",
          description: "Production server",
        },
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
      title: "Tapped API Reference",
      metaData: {
        title: "Tapped Ai API",
        description: "Tapped API documentation",
        ogDescription: "Tapped API documentation",
        ogTitle: "Tapped Ai API",
        ogImage: "https://tapped.ai/map-og.png",
        twitterCard: "summary_large_image",
      },
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
      const apiKey = req.headers["tapped-api-key"];

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

  fastify.addSchema({
    $id: "bookingSchema",
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      bookerId: { type: "string" },
      performerId: { type: "string" },
      rate: { type: "number" },
      location: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
        },
      },
      startTime: { type: "string", format: "date-time" },
      endTime: { type: "string", format: "date-time" },
      flierUrl: { type: "string" },
      eventUrl: { type: "string" },
      referenceEventId: { type: "string" },
    },
  });

  fastify.addSchema({
    $id: "reviewSchema",
    type: "object",
    properties: {
      id: { type: "string" },
      bookerId: { type: "string" },
      performerId: { type: "string" },
      bookingId: { type: "string" },
      timestamp: { type: "string", format: "date-time" },
      overallRating: { type: "number" },
      overallReview: { type: "string" },
      type: { type: "string", enum: ["performer", "booker"] },
    },
  });

  fastify.addSchema({
    $id: "performerSchema",
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      displayName: { type: "string" },
      bio: { type: "string" },
      profilePictureUrl: { type: "string" },
      location: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
        },
      },
      socialFollowing: {
        type: "object",
        properties: {
          youtubeChannelId: { type: "string" },
          tiktokHandle: { type: "string" },
          tiktokFollowers: { type: "number" },
          instagramHandle: { type: "string" },
          instagramFollowers: { type: "number" },
          twitterHandle: { type: "string" },
          twitterFollowers: { type: "number" },
          facebookHandle: { type: "string" },
          facebookFollowers: { type: "number" },
          spotifyUrl: { type: "string" },
          soundcloudHandle: { type: "string" },
          soundcloudFollowers: { type: "number" },
          audiusHandle: { type: "string" },
          audiusFollowers: { type: "number" },
          twitchHandle: { type: "string" },
          twitchFollowers: { type: "number" },
        },
      },
      averageTicketRange: {
        type: "object",
        properties: { min: { type: "number" }, max: { type: "number" } },
      },
      averageAttendance: { type: "number" },
      category: {
        type: "string",
        enum: [
          "undiscovered",
          "emerging",
          "hometownHero",
          "mainstream",
          "legendary",
        ],
      },
      pressKitUrl: { type: "string" },
      genres: { type: "array", items: { type: "string" } },
      spotifyId: { type: "string" },
      bookings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            count: { type: "number" },
            items: { type: "array", items: { $ref: "bookingSchema#" } },
          },
        },
      },
      reviews: {
        type: "object",
        properties: {
          count: { type: "number" },
          rating: { type: "number" },
          items: { type: "array", items: { $ref: "reviewSchema#" } },
        },
      },
    },
  });

  fastify.addSchema({
    $id: "venueSchema",
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      displayName: { type: "string" },
      bio: { type: "string" },
      profilePictureUrl: { type: "string" },
      location: {
        type: "object",
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
        },
        genres: { type: "array", items: { type: "string" } },
      },
      bookingEmail: { type: "string" },
      capacity: { type: "number" },
      idealPerformerProfile: { type: "string" },
      productionInfo: { type: "string" },
      frontOfHouse: { type: "string" },
      monitors: { type: "string" },
      microphones: { type: "string" },
      lights: { type: "string" },
      topPerformerIds: { type: "array", items: { type: "string" } },
      bookings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            count: { type: "number" },
            items: { type: "array", items: { $ref: "bookingSchema#" } },
          },
        },
      },
      reviews: {
        type: "object",
        properties: {
          count: { type: "number" },
          rating: { type: "number" },
          items: { type: "array", items: { $ref: "reviewSchema#" } },
        },
      },
    },
  });

  const headersSchema = {
    type: "object",
    properties: {
      "tapped-api-key": { type: "string" },
    },
    required: ["tapped-api-key"],
  };

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
    schema: {
      headers: headersSchema,
      response: {
        200: {
          type: "object",
          description: "Successful response",
          $ref: "performerSchema#",
        },
      },
    },
  });

  fastify.get("/v1/performer/username/:username", {
    preHandler: requireApiKey,
    handler: getUsernameController,
    schema: {
      headers: headersSchema,
      response: {
        200: {
          type: "object",
          description: "Successful response",
          $ref: "performerSchema#",
        },
      },
    },
  });

  fastify.get("/v1/location/:lat-:lng", {
    preHandler: requireApiKey,
    handler: getLocationController,
    schema: {
      headers: headersSchema,
      response: {
        200: {
          type: "object",
          description: "Successful response",
          properties: {
            venues: {
              type: "array",
              items: { type: "object", $ref: "venueSchema" },
            },
            topPerformers: {
              type: "array",
              items: { type: "object", $ref: "performerSchema#" },
            },
            genres: {
              type: "object",
            },
          },
        },
      },
    },
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
