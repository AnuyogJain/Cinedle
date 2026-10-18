import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userBackups = sqliteTable("user_backups", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  payload: text("payload").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const puzzleAssignments = sqliteTable(
  "puzzle_assignments",
  {
    assignmentKey: text("assignment_key").primaryKey(),
    mode: text("mode", { enum: ["daily", "unlimited"] }).notNull(),
    puzzleKey: text("puzzle_key").notNull(),
    filterKey: text("filter_key").notNull().default(""),
    dailyDate: text("daily_date"),
    tmdbId: integer("tmdb_id").notNull(),
    title: text("title").notNull(),
    year: integer("year").notNull(),
    genreIdsJson: text("genre_ids_json").notNull(),
    originCountry: text("origin_country").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    dailyDateIdx: index("puzzle_assignments_daily_date_idx").on(table.dailyDate),
  }),
);

export const gameProgress = sqliteTable(
  "game_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    puzzleKey: text("puzzle_key").notNull(),
    mode: text("mode", { enum: ["daily", "unlimited"] }).notNull(),
    solved: integer("solved", { mode: "boolean" }).notNull().default(false),
    guessCount: integer("guess_count").notNull().default(0),
    guessesJson: text("guesses_json").notNull().default("[]"),
    revealTitle: text("reveal_title"),
    revealYear: integer("reveal_year"),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.puzzleKey] }),
  }),
);
