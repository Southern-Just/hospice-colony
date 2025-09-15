import {
    pgTable, text, timestamp, integer, uuid, varchar, boolean, jsonb,date, real, numeric,
    unique
} from 'drizzle-orm/pg-core';
import { HOSPITAL_SPECIALTIES, HOSPITAL_STATUS } from "@/lib/constants";

// ---------------- USERS ----------------
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('staff'),
    hospitalId: uuid('hospital_id'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  hospitalId: uuid("hospital_id").notNull(),   
  bedId: uuid("bed_id"),
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 50 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  location: varchar("location", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  idNumber: varchar("id_number", { length: 255 }),
  healthCondition: varchar("health_condition", { length: 255 }),
  admissionDate: timestamp("admission_date").defaultNow(),
  dischargeDate: timestamp("discharge_date"),
  nextOfKin: varchar("next_of_kin", { length: 255 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insuranceNumber: varchar("insurance_number", { length: 255 }),
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
    specialties: jsonb("specialties").$type<(typeof HOSPITAL_SPECIALTIES)[number][]>(),
    phone: varchar('phone', { length: 20 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),

    email: varchar("email", { length: 255 }),
    notes: varchar("notes", { length: 500 }),
    address: varchar("address", { length: 255 }),
    zipCode: varchar("zip_code", { length: 20 }),
    website: varchar("website", { length: 255 }),
    contactTitle: varchar("contact_title", { length: 100 }),
    contactPerson: varchar("contact_person", { length: 255 }),
    partnershipDate: varchar("partnership_date", { length: 50 }),
    registrationNumber: varchar("registration_number", { length: 100 }),
    status: varchar("status", { length: 20 }).$type<typeof HOSPITAL_STATUS[number]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---------------- BEDS ----------------
export const beds = pgTable('beds', {
    id: uuid('id').defaultRandom().primaryKey(),
    hospitalId: uuid('hospital_id').notNull().references(() => hospitals.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 })
        .$type<'available' | 'occupied' | 'maintenance'>()
        .notNull()
        .default('available'),
    ward: varchar('ward', { length: 100 }).notNull(), // Specialty / ward
    bedNumber: varchar('bed_number', { length: 50 }).notNull(),
    priority: varchar('priority', { length: 50 }).notNull(),
    position: jsonb('position').notNull(), // e.g. { x: 1, y: 2 }
    pheromoneLevel: real('pheromone_level').notNull().default(1.0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        uniqueBed: unique().on(table.hospitalId, table.ward, table.bedNumber),
    };
});


// ---------------- PHEROMONES ----------------
export const pheromones = pgTable("pheromones", {
    id: varchar("id").primaryKey(),
    hospitalId: uuid("hospital_id").notNull(),
    bedId: varchar("bed_id").notNull(),
    pheromoneLevel: numeric("pheromone_level").notNull().default("1.0"),
    lastUpdated: timestamp("last_updated").defaultNow(),
});

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
