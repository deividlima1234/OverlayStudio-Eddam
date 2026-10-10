import { pgTable, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

export const overlays = pgTable("overlays", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
