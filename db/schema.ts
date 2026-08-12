import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["regular", "superadmin"]);

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("regular"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publicProfiles = pgTable(
  "public_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    username: text("username").notNull().unique(),
    displayName: text("display_name"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    theme: text("theme").notNull().default("default"),
    isPublished: boolean("is_published").notNull().default(false),
    pageViews: integer("page_views").notNull().default(0),
    socialLinks: jsonb("social_links").$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("public_profiles_user_id_idx").on(table.userId)],
);

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  position: integer("position").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pageAnalytics = pgTable("page_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => publicProfiles.id, { onDelete: "cascade" }),
  linkId: uuid("link_id").references(() => links.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // page_view | link_click
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type PublicProfile = typeof publicProfiles.$inferSelect;
export type Link = typeof links.$inferSelect;
export type PageAnalytics = typeof pageAnalytics.$inferSelect;
export type ProfileTheme = "default" | "dark" | "gradient" | "minimal" | "ocean";
