-- 010_reject_open_deal_insert.sql
--
-- 007 drops "Allow business inserts". Replaying 001.sql recreates it
-- (DROP IF EXISTS then CREATE ... WITH CHECK (true)). This event trigger
-- drops that named policy after any CREATE POLICY, so a 001 replay cannot
-- reopen the anon-insert hole regardless of migration order.
-- 001.sql is left unchanged.

DROP POLICY IF EXISTS "Allow business inserts" ON deals;

CREATE OR REPLACE FUNCTION reject_open_deal_insert_policy()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DROP POLICY IF EXISTS "Allow business inserts" ON public.deals;
END;
$$;

DROP EVENT TRIGGER IF EXISTS trg_reject_open_deal_insert_policy;
CREATE EVENT TRIGGER trg_reject_open_deal_insert_policy
  ON ddl_command_end
  WHEN TAG IN ('CREATE POLICY')
  EXECUTE FUNCTION reject_open_deal_insert_policy();
