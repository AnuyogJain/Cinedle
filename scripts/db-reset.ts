import { config } from "dotenv";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import {
  gameProgress,
  puzzleAssignments,
  sessions,
  userBackups,
  users,
} from "../lib/db/schema";
import { createScriptDb } from "../lib/db/script-client";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const db = createScriptDb();

  await db.delete(gameProgress);
  await db.delete(puzzleAssignments);
  await db.delete(sessions);
  await db.delete(userBackups);
  await db.delete(users);
  await db.run(sql`DROP TABLE IF EXISTS puzzle_pool_movies`);

  console.log(
    "Cleared app data and dropped legacy puzzle_pool_movies if present.",
  );
  console.log("Run npm run db:push to apply the puzzle_assignments schema.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
