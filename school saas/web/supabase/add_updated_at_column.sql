DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'lesson_plans'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE lesson_plans ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Try to create the trigger if moddatetime exists, otherwise just rely on manual updates or add the extension
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

DROP TRIGGER IF EXISTS handle_updated_at ON lesson_plans;

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON lesson_plans
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);
