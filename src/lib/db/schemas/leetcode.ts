import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// Topics table - categorizes problems by topic (e.g., "Arrays", "Dynamic Programming")
export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Problems table - stores LeetCode problem information
export const problems = pgTable("problems", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  url: text("url").notNull().unique(),
  status: varchar("status", { length: 50 }).notNull(), // "solved", "attempted", "not_started"
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // "easy", "medium", "hard"
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Attempts table - tracks each attempt at solving a problem
export const attempts = pgTable("attempts", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  solvedSolo: boolean("solved_solo").notNull().default(false),
  timeSpent: integer("time_spent").notNull(), // time in minutes
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Notes table - stores user notes for problems
export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
