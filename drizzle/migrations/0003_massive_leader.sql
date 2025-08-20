ALTER TABLE "hospitals" ALTER COLUMN "specialties" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "hospitals" ALTER COLUMN "specialties" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "hospitals" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "hospitals" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pheromones" ALTER COLUMN "hospital_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "hospital_id" SET DATA TYPE uuid;