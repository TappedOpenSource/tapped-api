import { configDotenv } from "dotenv";
configDotenv({
  path: ".env",
});

import { program } from "commander";
import { createApiKey, getUserById, getUserByUsername } from "../data/database";
import { queryUsers } from "../data/search";
import { transformUser } from "../utils/guarded_user";

program
  .name("tapped-api-client")
  .description("CLI client for Tapped API");

program.command("get-performer")
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

    console.log(JSON.stringify(transformUser(user), null, 2));
  });

program.command("search")
  .description("search for a performer by name or genre")
  .argument("<string>", "performer name")
  .action(async (str: string) => {
    const hits = await queryUsers(str, {
      hitsPerPage: 10,
    });

    const users = hits.map((hit) => transformUser(hit));

    console.log(JSON.stringify({ users }, null, 2));
  });

program.command("create-api-key")
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
