import { configDotenv } from "dotenv";
configDotenv({
  path: ".env",
});

import { program } from "commander";
import {
  createApiKey,
  getBookingsByRequesteeId,
  getPerformerReviewsByUserId,
  getUserById,
  getUserByUsername,
} from "../data/database";
import { queryUsers } from "../data/search";
import {
  transformBooking,
  transformReview,
  transformUser,
} from "../utils/transformers";

program.name("tapped-api-client").description("CLI client for Tapped API");

program
  .command("get-performer")
  .description("get a performer by id using different data sources")
  .argument("<string>", "the id of the performer")
  .option("-s, --source <string>", "the datasource", "tapped")
  .action(async (str: string, options) => {
    console.log({ source: options.source, id: str });

    const user = await getUserById(str);
    if (!user) {
      console.error("User not found");
      return;
    }

    const bookings = await getBookingsByRequesteeId(user.id);
    const reviews = await getPerformerReviewsByUserId(user.id);
    const guardedUser = transformUser({
      user,
      bookings: bookings.map(transformBooking),
      reviews: reviews.map(transformReview),
    });
    console.log(JSON.stringify(guardedUser));
  });

program
  .command("search")
  .description("search for a performer by name or genre")
  .argument("<string>", "performer name")
  .action(async (str: string) => {
    const hits = await queryUsers(str, {
      hitsPerPage: 10,
    });

    const users = await Promise.all(
      hits.map(async (hit) => {
        const bookings = await getBookingsByRequesteeId(hit.id);
        const reviews = await getPerformerReviewsByUserId(hit.id);
        const guardedUser = transformUser({
          user: hit,
          bookings: bookings.map(transformBooking),
          reviews: reviews.map(transformReview),
        });

        return guardedUser;
      }),
    );

    console.log(JSON.stringify({ users }, null, 2));
  });

program
  .command("create-api-key")
  .description("create a new API key")
  .option("-s, --save <username>", "save the API key for a username")
  .action(async (options) => {
    const rawUsername = options.save;
    if (!rawUsername) {
      const key = await createApiKey(options.save);
      console.log(key.key);
      return;
    }

    const user = await getUserByUsername(rawUsername);
    if (!user) {
      console.error(`User ${rawUsername} not found`);
      return;
    }

    const key = await createApiKey(user.id, {
      save: true,
    });
    console.log(key.key);
  });

program.parse();
