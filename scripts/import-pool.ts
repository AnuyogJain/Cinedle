import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isEligibleMovieTitle, type PoolMovie } from "../lib/title-normalize";
import { createScriptDb } from "../lib/db/script-client";
import {
  countPoolMoviesScript,
  upsertPoolMoviesScript,
} from "../lib/pool-db-script";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const DEFAULT_JSON = resolve(process.cwd(), "data/puzzle-pool.json");

async function main() {
  const jsonPath = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : DEFAULT_JSON;

  const raw = readFileSync(jsonPath, "utf8");
  const movies = (JSON.parse(raw) as PoolMovie[]).filter((m) =>
    isEligibleMovieTitle(m.title),
  );

  const db = createScriptDb();
  await upsertPoolMoviesScript(db, movies);
  const total = await countPoolMoviesScript(db);
  console.log(`Imported ${movies.length} from ${jsonPath}. DB total: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
