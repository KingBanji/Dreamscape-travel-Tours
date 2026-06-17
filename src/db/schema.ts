import { pgTable, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").default(sql`('u-' || md5(random()::text))`).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  password: text("password"),
  phone: text("phone"),
  role: text("role").default("traveler").notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false),
  tempOtp: text("temp_otp"),
  tempOtpExpiry: text("temp_otp_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: text("id").default(sql`('t-' || md5(random()::text))`).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  destination: text("destination").notNull(),
  durationDays: integer("duration_days").default(1),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  maxSeats: integer("max_seats").default(10),
  availableSeats: integer("available_seats").default(10),
  imageUrl: text("image_url"),
  departureDate: text("departure_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id").default(sql`('b-' || md5(random()::text))`).primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tourId: text("tour_id")
    .references(() => tours.id, { onDelete: "cascade" })
    .notNull(),
  seats: integer("seats").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
}));
