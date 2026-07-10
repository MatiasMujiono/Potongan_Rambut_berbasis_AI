import {
  mysqlTable,
  varchar,
  timestamp,
  int,
  json,
  text,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey(),
  email: varchar("email", { length: 191 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 10 }).default("user"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export const hairstyle = mysqlTable("hairstyle", {
  id: varchar("id", { length: 191 }).primaryKey(),
  modelrambut: varchar("modelrambut", { length: 50 }),
  images: text("images"),
  spesifikasi: json("spesifikasi"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 191 }).primaryKey(),
  sessionToken: varchar("sessionToken", { length: 191 }).unique().notNull(),
  userId: varchar("userId", { length: 191 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  accessToken: varchar("accessToken", { length: 500 }),
  refreshToken: varchar("refreshToken", { length: 500 }),
  accessTokenExpires: timestamp("accessTokenExpires"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  lastActivity: timestamp("lastActivity"),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
