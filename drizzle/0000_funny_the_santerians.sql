CREATE TABLE "account_profile" (
	"account_id" text PRIMARY KEY NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "failed_queue_event" (
	"consumer_name" text NOT NULL,
	"message_id" text NOT NULL,
	"event_id" uuid,
	"correlation_id" uuid,
	"failure_code" text NOT NULL,
	"delivery_count" integer NOT NULL,
	"failed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "failed_queue_event_consumer_name_message_id_pk" PRIMARY KEY("consumer_name","message_id")
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"aaguid" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "passkey_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "processed_queue_events" (
	"consumer_name" text NOT NULL,
	"event_id" uuid NOT NULL,
	"claim_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "processed_queue_events_consumer_name_event_id_pk" PRIMARY KEY("consumer_name","event_id"),
	CONSTRAINT "processed_queue_events_status_check" CHECK ("processed_queue_events"."status" in ('processing', 'completed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "profile_update_audit_receipt" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"correlation_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transactional_outbox_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"event_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	CONSTRAINT "transactional_outbox_messages_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_role_check" CHECK ("user"."role" in ('user', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_profile" ADD CONSTRAINT "account_profile_account_id_user_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_account_id_unique" ON "account" USING btree ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rate_limit_last_request_idx" ON "rate_limit" USING btree ("last_request");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "processed_queue_events_claimed_at_idx" ON "processed_queue_events" USING btree ("claimed_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactional_outbox_unpublished_idx" ON "transactional_outbox_messages" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");