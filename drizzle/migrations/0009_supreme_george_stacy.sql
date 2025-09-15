ALTER TABLE "patients" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "bed_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "contact" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "id_number" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "health_condition" SET DATA TYPE varchar(255);