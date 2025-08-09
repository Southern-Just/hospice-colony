import { pgTable, text, timestamp, integer, uuid, varchar, boolean, jsonb, real, numeric } from 'drizzle-orm/pg-core';

// ---------------- USERS ----------------
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('staff'),
    hospitalId: varchar('hospital_id', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- SESSIONS ----------------
export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---------------- HOSPITALS ----------------
export const hospitals = pgTable('hospitals', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    totalBeds: integer('total_beds').notNull(),
    availableBeds: integer('available_beds').notNull().default(0),
    specialties: text('specialties').array().notNull().default([]),
    phone: varchar('phone', { length: 20 }),
    status: text('status').default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- BEDS ----------------
export const beds = pgTable('beds', {
    id: varchar('id').primaryKey(), // e.g., "bed-1"
    hospitalId: uuid('hospital_id').notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
    status: varchar('status').notNull(), // available, occupied, maintenance, reserved
    ward: varchar('ward').notNull(), // ICU, Emergency, etc.
    bedNumber: varchar('bed_number').notNull(), // e.g., A1
    priority: varchar('priority').notNull(), // low, medium, high
    position: jsonb('position').notNull(), // { x: number, y: number }
    pheromoneLevel: real('pheromone_level').notNull().default(1.0), // learning weight for ACO
});

// // ---------------- PHEROMONES (ACO STATE) ----------------
// export const pheromones = pgTable('pheromones', {
//     id: uuid('id').defaultRandom().primaryKey(),
//     hospitalId: uuid('hospital_id').notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
//     fromNode: varchar('from_node').notNull(), // could be bed ID or location node
//     toNode: varchar('to_node').notNull(), // could be bed ID or location node
//     value: real('value').notNull().default(1.0), // pheromone intensity
//     lastUpdated: timestamp('last_updated').defaultNow().notNull(),
// });

export const pheromones = pgTable(
    "pheromones",
    {
        id: varchar("id").primaryKey(), // unique key: `${hospitalId}-${bedId}`
        hospitalId: varchar("hospital_id").notNull(),
        bedId: varchar("bed_id").notNull(),
        pheromoneLevel: numeric("pheromone_level").notNull().default("1.0"),
        lastUpdated: timestamp("last_updated").defaultNow(),
    }
);
// ---------------- TYPES ----------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type Hospital = typeof hospitals.$inferSelect;
export type NewHospital = typeof hospitals.$inferInsert;

export type Bed = typeof beds.$inferSelect;
export type NewBed = typeof beds.$inferInsert;

export type Pheromone = typeof pheromones.$inferSelect;
export type NewPheromone = typeof pheromones.$inferInsert;
