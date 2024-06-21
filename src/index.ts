import Fastify from "fastify";
import { configDotenv } from "dotenv";

const port = parseInt(process.env.PORT || "3000");
const host = process.env.ADDRESS || "0.0.0.0";
const fastify = Fastify({
  logger: true,
});

fastify.get("/", async function handler() {
  return { status: "ok" };
});

fastify.get("/health", async function handler() {
  return { status: "ok" };
});

fastify.get("/version", async function handler() {

});

fastify.get("/v1/performer/search", async function handler(request, reply) {
  const { q } = request.query as { q: string };
  request.log.info(`search query ${q}`);

  // TODO: search algolia with q    
  const res: unknown[] = [];

  reply.send({
    performers: res,
  });
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

export async function startServer() {
  try {
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
  configDotenv({
    path: ".env",
  });

  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
