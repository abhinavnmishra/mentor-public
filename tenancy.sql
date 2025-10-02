
-- -- Add clear unused schema
--
-- DROP SCHEMA snapshot_20250728_active CASCADE;
-- DROP SCHEMA snapshot_20250723_active CASCADE;
-- DROP SCHEMA snapshot_20250723 CASCADE;
--
-- -- Add experiment schema
--
-- CREATE SCHEMA snapshot_experiment_1;
-- REVOKE ALL ON SCHEMA snapshot_experiment_1 FROM PUBLIC;

-- 1) Migration role (Flyway): can DDL
-- CREATE ROLE mentivo_flyway LOGIN PASSWORD '...';
-- It needs: CREATE/ALTER/DROP on target schema(s)
-- GRANT CREATE, USAGE ON SCHEMA snapshot_experiment_1 TO mentivo_flyway;
-- if the history table already exists but is owned by the wrong role:
-- ALTER TABLE snapshot_experiment_1.flyway_schema_history OWNER TO mentivo_flyway;
-- optional: prevent future surprises
-- GRANT SELECT, INSERT, UPDATE, DELETE ON snapshot_experiment_1.flyway_schema_history TO mentivo_flyway;

-- 2) Application role: DML only, NO DDL, NO BYPASSRLS
-- CREATE ROLE mentivo_app LOGIN PASSWORD '...';
-- Database-level
-- GRANT CONNECT, TEMP ON DATABASE postgres TO mentivo_app;
--
-- -- Schemas used by your app
-- GRANT USAGE ON SCHEMA snapshot_experiment_1 TO mentivo_app;  -- your data schema
-- GRANT USAGE ON SCHEMA app TO mentivo_app;                    -- where RLS helper functions live
-- GRANT USAGE ON SCHEMA public TO mentivo_app;                 -- extensions (pgcrypto/uuid-ossp), common funcs
--
-- -- Tables (existing + future)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA snapshot_experiment_1 TO mentivo_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA snapshot_experiment_1
--     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mentivo_app;
--
-- -- Sequences (for SERIAL/IDENTITY)
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA snapshot_experiment_1 TO mentivo_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA snapshot_experiment_1
--     GRANT USAGE, SELECT ON SEQUENCES TO mentivo_app;
--
-- -- Execute helper functions
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO mentivo_app;


-- 3) Read-only role (optional)
-- CREATE ROLE mentivo_readonly LOGIN PASSWORD '...';
-- GRANT USAGE ON SCHEMA snapshot_experiment_1 TO mentivo_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA snapshot_experiment_1 TO mentivo_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA snapshot_experiment_1 GRANT SELECT ON TABLES TO mentivo_readonly;

--
-- CREATE TABLE snapshot_experiment_1.chats (LIKE public.chats INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.chats SELECT * FROM public.chats;
--
-- CREATE TABLE snapshot_experiment_1.agent_token_monthly_usage (LIKE public.agent_token_monthly_usage INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.agent_token_monthly_usage SELECT * FROM public.agent_token_monthly_usage;
--
-- CREATE TABLE snapshot_experiment_1.coaching_program (LIKE public.coaching_program INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.coaching_program SELECT * FROM public.coaching_program;
--
-- CREATE TABLE snapshot_experiment_1.focus_area (LIKE public.focus_area INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.focus_area SELECT * FROM public.focus_area;
--
-- CREATE TABLE snapshot_experiment_1.coaching_program_focus_areas (LIKE public.coaching_program_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.coaching_program_focus_areas SELECT * FROM public.coaching_program_focus_areas;
--
-- CREATE TABLE snapshot_experiment_1.coaching_session (LIKE public.coaching_session INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.coaching_session SELECT * FROM public.coaching_session;
--
-- CREATE TABLE snapshot_experiment_1.activity (LIKE public.activity INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.activity SELECT * FROM public.activity;
--
-- CREATE TABLE snapshot_experiment_1.agent_chat (LIKE public.agent_chat INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.agent_chat SELECT * FROM public.agent_chat;
--
-- CREATE TABLE snapshot_experiment_1.calendar_event (LIKE public.calendar_event INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.calendar_event SELECT * FROM public.calendar_event;
--
-- CREATE TABLE snapshot_experiment_1.client_organisation (LIKE public.client_organisation INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.client_organisation SELECT * FROM public.client_organisation;
--
-- CREATE TABLE snapshot_experiment_1.milestone_tracker (LIKE public.milestone_tracker INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.milestone_tracker SELECT * FROM public.milestone_tracker;
--
-- CREATE TABLE snapshot_experiment_1.peer_review (LIKE public.peer_review INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.peer_review SELECT * FROM public.peer_review;
--
-- CREATE TABLE snapshot_experiment_1.public_asset (LIKE public.public_asset INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.public_asset SELECT * FROM public.public_asset;
--
-- CREATE TABLE snapshot_experiment_1.program_milestone (LIKE public.program_milestone INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.program_milestone SELECT * FROM public.program_milestone;
--
-- CREATE TABLE snapshot_experiment_1.report (LIKE public.report INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.report SELECT * FROM public.report;
--
-- CREATE TABLE snapshot_experiment_1.program_milestone_focus_areas (LIKE public.program_milestone_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.program_milestone_focus_areas SELECT * FROM public.program_milestone_focus_areas;
--
-- CREATE TABLE snapshot_experiment_1.report_view (LIKE public.report_view INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.report_view SELECT * FROM public.report_view;
--
-- CREATE TABLE snapshot_experiment_1.session_focus_areas (LIKE public.session_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.session_focus_areas SELECT * FROM public.session_focus_areas;
--
-- CREATE TABLE snapshot_experiment_1.report_wizard_chat (LIKE public.report_wizard_chat INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.report_wizard_chat SELECT * FROM public.report_wizard_chat;
--
-- CREATE TABLE snapshot_experiment_1.survey (LIKE public.survey INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.survey SELECT * FROM public.survey;
--
-- CREATE TABLE snapshot_experiment_1.users (LIKE public.users INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.users SELECT * FROM public.users;
--
-- CREATE TABLE snapshot_experiment_1.trainer_organisation (LIKE public.trainer_organisation INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.trainer_organisation SELECT * FROM public.trainer_organisation;
--
-- CREATE TABLE snapshot_experiment_1.session (LIKE public.session INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.session SELECT * FROM public.session;
--
-- CREATE TABLE snapshot_experiment_1.survey_response (LIKE public.survey_response INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.survey_response SELECT * FROM public.survey_response;
--
-- CREATE TABLE snapshot_experiment_1.trainer (LIKE public.trainer INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.trainer SELECT * FROM public.trainer;
--
-- CREATE TABLE snapshot_experiment_1.client (LIKE public.client INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.client SELECT * FROM public.client;
--
-- CREATE TABLE snapshot_experiment_1.exercise (LIKE public.exercise INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.exercise SELECT * FROM public.exercise;
--
-- CREATE TABLE snapshot_experiment_1.exercise_response (LIKE public.exercise_response INCLUDING ALL);
-- INSERT INTO snapshot_experiment_1.exercise_response SELECT * FROM public.exercise_response;
--
-- -- Add active schema
--
-- CREATE SCHEMA snapshot_active_4;
-- REVOKE ALL ON SCHEMA snapshot_active_4 FROM PUBLIC;

-- -- 1) Migration role (Flyway): can DDL
-- CREATE ROLE mentivo_flyway LOGIN PASSWORD '...';
-- -- It needs: CREATE/ALTER/DROP on target schema(s)
-- GRANT CREATE, USAGE ON SCHEMA snapshot_active_4 TO mentivo_flyway;
--
-- -- 2) Application role: DML only, NO DDL, NO BYPASSRLS
-- CREATE ROLE mentivo_app LOGIN PASSWORD '...';
-- GRANT USAGE ON SCHEMA snapshot_active_4 TO mentivo_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA snapshot_active_4 TO mentivo_app;
-- -- for future tables:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA snapshot_active_4 GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mentivo_app;
--GRANT USAGE ON SCHEMA app TO mentivo_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO mentivo_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT EXECUTE ON FUNCTIONS TO mentivo_app;
-- -- 3) Read-only role (optional)
-- CREATE ROLE mentivo_readonly LOGIN PASSWORD '...';
-- GRANT USAGE ON SCHEMA snapshot_active_4 TO mentivo_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA snapshot_active_4 TO mentivo_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA snapshot_active_4 GRANT SELECT ON TABLES TO mentivo_readonly;
--
-- CREATE TABLE snapshot_active_4.chats (LIKE public.chats INCLUDING ALL);
-- INSERT INTO snapshot_active_4.chats SELECT * FROM public.chats;
--
-- CREATE TABLE snapshot_active_4.agent_token_monthly_usage (LIKE public.agent_token_monthly_usage INCLUDING ALL);
-- INSERT INTO snapshot_active_4.agent_token_monthly_usage SELECT * FROM public.agent_token_monthly_usage;
--
-- CREATE TABLE snapshot_active_4.coaching_program (LIKE public.coaching_program INCLUDING ALL);
-- INSERT INTO snapshot_active_4.coaching_program SELECT * FROM public.coaching_program;
--
-- CREATE TABLE snapshot_active_4.focus_area (LIKE public.focus_area INCLUDING ALL);
-- INSERT INTO snapshot_active_4.focus_area SELECT * FROM public.focus_area;
--
-- CREATE TABLE snapshot_active_4.coaching_program_focus_areas (LIKE public.coaching_program_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_active_4.coaching_program_focus_areas SELECT * FROM public.coaching_program_focus_areas;
--
-- CREATE TABLE snapshot_active_4.coaching_session (LIKE public.coaching_session INCLUDING ALL);
-- INSERT INTO snapshot_active_4.coaching_session SELECT * FROM public.coaching_session;
--
-- CREATE TABLE snapshot_active_4.activity (LIKE public.activity INCLUDING ALL);
-- INSERT INTO snapshot_active_4.activity SELECT * FROM public.activity;
--
-- CREATE TABLE snapshot_active_4.agent_chat (LIKE public.agent_chat INCLUDING ALL);
-- INSERT INTO snapshot_active_4.agent_chat SELECT * FROM public.agent_chat;
--
-- CREATE TABLE snapshot_active_4.calendar_event (LIKE public.calendar_event INCLUDING ALL);
-- INSERT INTO snapshot_active_4.calendar_event SELECT * FROM public.calendar_event;
--
-- CREATE TABLE snapshot_active_4.client_organisation (LIKE public.client_organisation INCLUDING ALL);
-- INSERT INTO snapshot_active_4.client_organisation SELECT * FROM public.client_organisation;
--
-- CREATE TABLE snapshot_active_4.milestone_tracker (LIKE public.milestone_tracker INCLUDING ALL);
-- INSERT INTO snapshot_active_4.milestone_tracker SELECT * FROM public.milestone_tracker;
--
-- CREATE TABLE snapshot_active_4.peer_review (LIKE public.peer_review INCLUDING ALL);
-- INSERT INTO snapshot_active_4.peer_review SELECT * FROM public.peer_review;
--
-- CREATE TABLE snapshot_active_4.public_asset (LIKE public.public_asset INCLUDING ALL);
-- INSERT INTO snapshot_active_4.public_asset SELECT * FROM public.public_asset;
--
-- CREATE TABLE snapshot_active_4.program_milestone (LIKE public.program_milestone INCLUDING ALL);
-- INSERT INTO snapshot_active_4.program_milestone SELECT * FROM public.program_milestone;
--
-- CREATE TABLE snapshot_active_4.report (LIKE public.report INCLUDING ALL);
-- INSERT INTO snapshot_active_4.report SELECT * FROM public.report;
--
-- CREATE TABLE snapshot_active_4.program_milestone_focus_areas (LIKE public.program_milestone_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_active_4.program_milestone_focus_areas SELECT * FROM public.program_milestone_focus_areas;
--
-- CREATE TABLE snapshot_active_4.report_view (LIKE public.report_view INCLUDING ALL);
-- INSERT INTO snapshot_active_4.report_view SELECT * FROM public.report_view;
--
-- CREATE TABLE snapshot_active_4.session_focus_areas (LIKE public.session_focus_areas INCLUDING ALL);
-- INSERT INTO snapshot_active_4.session_focus_areas SELECT * FROM public.session_focus_areas;
--
-- CREATE TABLE snapshot_active_4.report_wizard_chat (LIKE public.report_wizard_chat INCLUDING ALL);
-- INSERT INTO snapshot_active_4.report_wizard_chat SELECT * FROM public.report_wizard_chat;
--
-- CREATE TABLE snapshot_active_4.survey (LIKE public.survey INCLUDING ALL);
-- INSERT INTO snapshot_active_4.survey SELECT * FROM public.survey;
--
-- CREATE TABLE snapshot_active_4.users (LIKE public.users INCLUDING ALL);
-- INSERT INTO snapshot_active_4.users SELECT * FROM public.users;
--
-- CREATE TABLE snapshot_active_4.trainer_organisation (LIKE public.trainer_organisation INCLUDING ALL);
-- INSERT INTO snapshot_active_4.trainer_organisation SELECT * FROM public.trainer_organisation;
--
-- CREATE TABLE snapshot_active_4.session (LIKE public.session INCLUDING ALL);
-- INSERT INTO snapshot_active_4.session SELECT * FROM public.session;
--
-- CREATE TABLE snapshot_active_4.survey_response (LIKE public.survey_response INCLUDING ALL);
-- INSERT INTO snapshot_active_4.survey_response SELECT * FROM public.survey_response;
--
-- CREATE TABLE snapshot_active_4.trainer (LIKE public.trainer INCLUDING ALL);
-- INSERT INTO snapshot_active_4.trainer SELECT * FROM public.trainer;
--
-- CREATE TABLE snapshot_active_4.client (LIKE public.client INCLUDING ALL);
-- INSERT INTO snapshot_active_4.client SELECT * FROM public.client;
--
-- CREATE TABLE snapshot_active_4.exercise (LIKE public.exercise INCLUDING ALL);
-- INSERT INTO snapshot_active_4.exercise SELECT * FROM public.exercise;
--
-- CREATE TABLE snapshot_active_4.exercise_response (LIKE public.exercise_response INCLUDING ALL);
-- INSERT INTO snapshot_active_4.exercise_response SELECT * FROM public.exercise_response;

-- The following is my DDL migration script for implementing RLS. How do I make sure these changes remains going forward even though I change schema or DB in future.
-- It should be part of the deployment process to ensure RLS is always in place. What changes should I make to the JPA and how do I configure the flywheel script for this?
-- Also do you feel we can simplify this script?

-- Add tenant column

ALTER TABLE snapshot_experiment_1.public_asset ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.coaching_session ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.agent_token_monthly_usage ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.client ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.session ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.survey_response ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.agent_chat ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.report ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.report_view ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.survey ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.trainer ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.milestone_tracker ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.client_organisation ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.coaching_program_focus_areas ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.program_milestone ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.program_milestone_focus_areas ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.peer_review ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.coaching_program ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.session_focus_areas ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.chats ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.focus_area ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.report_wizard_chat ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.activity ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.exercise_response ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.exercise ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.users ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);
ALTER TABLE snapshot_experiment_1.calendar_event ADD COLUMN IF NOT EXISTS tenant_id varchar(255) DEFAULT current_setting('app.current_tenant', true);

-- Enable RLS

ALTER TABLE snapshot_experiment_1.public_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.agent_token_monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.client ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.session ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.survey_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.agent_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.trainer ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.milestone_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.client_organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_program_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.program_milestone ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.program_milestone_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.peer_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.session_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.focus_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report_wizard_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.exercise_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.calendar_event ENABLE ROW LEVEL SECURITY;

-- FORCE RLS

ALTER TABLE snapshot_experiment_1.public_asset FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_session FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.agent_token_monthly_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.client FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.session FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.survey_response FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.agent_chat FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report_view FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.survey FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.trainer FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.milestone_tracker FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.client_organisation FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_program_focus_areas FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.program_milestone FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.program_milestone_focus_areas FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.peer_review FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.coaching_program FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.session_focus_areas FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.chats FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.focus_area FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.report_wizard_chat FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.activity FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.exercise_response FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.exercise FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.users FORCE ROW LEVEL SECURITY;
ALTER TABLE snapshot_experiment_1.calendar_event FORCE ROW LEVEL SECURITY;

-- Policy: only rows matching current tenant are visible

CREATE POLICY public_asset_tenant_policy ON snapshot_experiment_1.public_asset
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY coaching_session_tenant_policy ON snapshot_experiment_1.coaching_session
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY agent_token_monthly_usage_tenant_policy ON snapshot_experiment_1.agent_token_monthly_usage
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY client_tenant_policy ON snapshot_experiment_1.client
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY session_tenant_policy ON snapshot_experiment_1.session
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY survey_response_tenant_policy ON snapshot_experiment_1.survey_response
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY agent_chat_tenant_policy ON snapshot_experiment_1.agent_chat
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY report_tenant_policy ON snapshot_experiment_1.report
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY report_view_tenant_policy ON snapshot_experiment_1.report_view
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY survey_tenant_policy ON snapshot_experiment_1.survey
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY trainer_tenant_policy ON snapshot_experiment_1.trainer
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY milestone_tracker_tenant_policy ON snapshot_experiment_1.milestone_tracker
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY client_organisation_tenant_policy ON snapshot_experiment_1.client_organisation
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY coaching_program_focus_areas_tenant_policy ON snapshot_experiment_1.coaching_program_focus_areas
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY program_milestone_tenant_policy ON snapshot_experiment_1.program_milestone
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY program_milestone_focus_areas_tenant_policy ON snapshot_experiment_1.program_milestone_focus_areas
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY peer_review_tenant_policy ON snapshot_experiment_1.peer_review
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY coaching_program_tenant_policy ON snapshot_experiment_1.coaching_program
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY session_focus_areas_tenant_policy ON snapshot_experiment_1.session_focus_areas
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY chats_tenant_policy ON snapshot_experiment_1.chats
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY focus_area_tenant_policy ON snapshot_experiment_1.focus_area
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY report_wizard_chat_tenant_policy ON snapshot_experiment_1.report_wizard_chat
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY activity_tenant_policy ON snapshot_experiment_1.activity
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY exercise_response_tenant_policy ON snapshot_experiment_1.exercise_response
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY exercise_tenant_policy ON snapshot_experiment_1.exercise
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY users_tenant_policy ON snapshot_experiment_1.users
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));

CREATE POLICY calendar_event_tenant_policy ON snapshot_experiment_1.calendar_event
USING (tenant_id = current_setting('app.current_tenant', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant', true));


-- 1) (Re)create the guard function.
CREATE OR REPLACE FUNCTION snapshot_experiment_1.require_tenant() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('app.current_tenant', true) IS NULL
     OR current_setting('app.current_tenant', true) = '' THEN
    RAISE EXCEPTION 'RLS guard: app.current_tenant is not set';
END IF;
RETURN NULL; -- statement-level trigger: we don't modify rows
END;
$$;


DO $$
DECLARE t record;
BEGIN
FOR t IN
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'snapshot_experiment_1'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('public_asset', 'coaching_session', 'agent_token_monthly_usage', 'client', 'session', 'survey_response', 'agent_chat', 'report', 'report_view', 'survey', 'trainer', 'milestone_tracker', 'client_organisation', 'coaching_program_focus_areas', 'program_milestone', 'program_milestone_focus_areas', 'peer_review', 'coaching_program', 'session_focus_areas', 'chats', 'focus_area', 'report_wizard_chat', 'activity', 'exercise_response', 'exercise', 'users', 'calendar_event' /* add your list here */)
    LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_require_tenant ON %I.%I', t.table_name, t.table_schema, t.table_name);
EXECUTE format(
        'CREATE TRIGGER %I_require_tenant BEFORE INSERT OR UPDATE OR DELETE ON %I.%I
         FOR EACH STATEMENT EXECUTE FUNCTION require_tenant()',
        t.table_name, t.table_schema, t.table_name
        );
END LOOP;
END$$;
