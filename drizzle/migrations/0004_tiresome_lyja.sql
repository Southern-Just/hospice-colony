ALTER TABLE "beds" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "status" SET DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "ward" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "bed_number" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "beds" ALTER COLUMN "priority" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_ward_bed_number_unique" UNIQUE("hospital_id","ward","bed_number");