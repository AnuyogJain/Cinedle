import "server-only";

import { eq, type SQL } from "drizzle-orm";
import { requestUserId } from "@/lib/auth/user-context";
import { gameProgress } from "./schema";

export function forUser(table: typeof gameProgress): SQL {
  return eq(table.userId, requestUserId());
}
