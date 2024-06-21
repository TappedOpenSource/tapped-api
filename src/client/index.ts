import { program } from "commander";

program
  .name("tapped-api-client")
  .description("CLI client for Tapped API");

program.command("get-performer")
  .description("get a performer by id using different data sources")
  .argument("<string>", "the id of the performer")
  .option("-s, --separator <string>", "the datasource", "tapped")
  .action((str, options) => {
    console.log({ str, options })
  });

program.command("search")
  .description("search for a performer by name or genre")
  .argument("<string>", "performer name")
  .option("--first", "display just the first substring")
  .option("-s, --separator <char>", "separator character", ",")
  .action((str, options) => {
    console.log({ str, options })
  });

program.parse();
