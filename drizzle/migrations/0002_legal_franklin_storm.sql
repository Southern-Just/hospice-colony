CREATE TABLE "pheromones" (
	"id" varchar PRIMARY KEY NOT NULL,
	"hospital_id" varchar NOT NULL,
	"bed_id" varchar NOT NULL,
	"pheromone_level" numeric DEFAULT '1.0' NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admissions" CASCADE;--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "hospital_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "pheromone_level" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_hospitals_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;