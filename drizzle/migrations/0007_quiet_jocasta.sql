CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hospital_id" integer NOT NULL,
	"bed_id" integer,
	"name" varchar(255) NOT NULL,
	"gender" varchar(50) NOT NULL,
	"date_of_birth" date NOT NULL,
	"location" varchar(255),
	"contact" varchar(100),
	"id_number" varchar(100),
	"health_condition" text,
	"admission_date" timestamp DEFAULT now(),
	"discharge_date" timestamp,
	"next_of_kin" varchar(255),
	"insurance_provider" varchar(255),
	"insurance_number" varchar(255)
);
