ALTER TABLE "hospitals" ALTER COLUMN "specialties" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "city" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "state" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "notes" varchar(500);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "address" varchar(255);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "zip_code" varchar(20);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "contact_title" varchar(100);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "contact_person" varchar(255);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "partnership_date" varchar(50);--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "registration_number" varchar(100);