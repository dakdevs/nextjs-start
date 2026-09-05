CREATE TABLE "admin_audit_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"actor_user_id" text,
	"subject_user_id" text,
	"outcome" text NOT NULL,
	"target_kind" text NOT NULL,
	"target_id" text NOT NULL,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_bootstrap_claim" (
	"singleton" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"admin_user_id" text NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_bootstrap_claim_singleton_check" CHECK ("admin_bootstrap_claim"."singleton" = true)
);
--> statement-breakpoint
CREATE TABLE "service_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"token_prefix" text NOT NULL,
	"token_digest" text NOT NULL,
	"scopes" text[] NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rotated_at" timestamp,
	"revoked_at" timestamp,
	"last_used_at" timestamp,
	CONSTRAINT "service_account_token_prefix_unique" UNIQUE("token_prefix"),
	CONSTRAINT "service_account_token_digest_unique" UNIQUE("token_digest"),
	CONSTRAINT "service_account_scope_check" CHECK (cardinality("service_account"."scopes") > 0 and "service_account"."scopes" <@ ARRAY['system:health:read']::text[])
);
--> statement-breakpoint
ALTER TABLE "admin_audit_event" ADD CONSTRAINT "admin_audit_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_event" ADD CONSTRAINT "admin_audit_event_subject_user_id_user_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_bootstrap_claim" ADD CONSTRAINT "admin_bootstrap_claim_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_account" ADD CONSTRAINT "service_account_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_event_created_at_idx" ON "admin_audit_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "service_account_active_idx" ON "service_account" USING btree ("revoked_at");
--> statement-breakpoint
-- Existing installations may have assigned one global administrator before this
-- bootstrap mechanism existed. Reconcile that administrator before installing the
-- guard which makes future role promotion claim-backed. More than one existing
-- administrator has no safe, automatic winner, so stop the migration instead.
LOCK TABLE "user" IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
DO $$
DECLARE
	existing_admin_id text;
	existing_admin_count integer;
BEGIN
	SELECT count(*), min(id)
	INTO existing_admin_count, existing_admin_id
	FROM "user"
	WHERE role = 'admin';

	IF existing_admin_count > 1 THEN
		RAISE EXCEPTION 'admin bootstrap migration is ambiguous: found % existing administrators', existing_admin_count;
	END IF;

	IF existing_admin_count = 1 THEN
		INSERT INTO admin_bootstrap_claim (singleton, admin_user_id)
		VALUES (true, existing_admin_id);
	END IF;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION guard_admin_role_promotion() RETURNS trigger AS $$
BEGIN
	IF NEW.role = 'admin' AND OLD.role <> 'admin' AND NOT EXISTS (
		SELECT 1 FROM admin_bootstrap_claim
		WHERE singleton = true AND admin_user_id = NEW.id
	) THEN
		RAISE EXCEPTION 'administrator promotion requires the bootstrap claim';
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER user_admin_role_promotion_guard
BEFORE UPDATE OF role ON "user"
FOR EACH ROW EXECUTE FUNCTION guard_admin_role_promotion();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION claim_first_verified_session_admin() RETURNS trigger AS $$
BEGIN
	IF NEW.impersonated_by IS NULL AND EXISTS (
		SELECT 1 FROM "user"
		WHERE id = NEW.user_id AND email_verified = true AND banned = false
	) THEN
		INSERT INTO admin_bootstrap_claim (singleton, admin_user_id)
		VALUES (true, NEW.user_id)
		ON CONFLICT (singleton) DO NOTHING;

		IF FOUND THEN
			UPDATE "user"
			SET role = 'admin', updated_at = now()
			WHERE id = NEW.user_id AND role = 'user';

			INSERT INTO admin_audit_event (
				action,
				actor_user_id,
				subject_user_id,
				outcome,
				target_kind,
				target_id,
				correlation_id
			) VALUES (
				'admin.bootstrap.claimed',
				NEW.user_id,
				NEW.user_id,
				'succeeded',
				'user',
				NEW.user_id,
				gen_random_uuid()
			);
		END IF;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER session_admin_bootstrap
AFTER INSERT ON "session"
FOR EACH ROW EXECUTE FUNCTION claim_first_verified_session_admin();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_admin_audit_event_mutation() RETURNS trigger AS $$
BEGIN
	RAISE EXCEPTION 'admin audit events are immutable';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER admin_audit_event_immutable
BEFORE UPDATE OR DELETE ON admin_audit_event
FOR EACH ROW EXECUTE FUNCTION prevent_admin_audit_event_mutation();
