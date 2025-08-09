CREATE TABLE "admissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" integer NOT NULL,
	"patient_name" varchar(255) NOT NULL,
	"admitted_at" timestamp DEFAULT now()
);
