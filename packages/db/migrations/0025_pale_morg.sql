CREATE TABLE "mail0_theme" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"colors" jsonb NOT NULL,
	"fonts" jsonb NOT NULL,
	"radii" jsonb NOT NULL,
	"spacing" jsonb NOT NULL,
	"shadows" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mail0_user_settings" ALTER COLUMN "settings" SET DEFAULT '{"language":"en","timezone":"UTC","dynamicContent":false,"externalImages":true,"customPrompt":"","trustedSenders":[],"isOnboarded":false,"colorTheme":"system"}'::jsonb;