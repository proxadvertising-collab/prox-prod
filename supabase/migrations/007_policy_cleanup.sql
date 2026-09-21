-- 007_policy_cleanup.sql
--
-- Closes an over-permissive insert policy left behind by 001.sql.
--
-- 001.sql created "Allow business inserts" ON deals FOR INSERT WITH CHECK (true),
-- which lets ANYONE (including anonymous callers) insert deals. 003_rls.sql was
-- meant to replace the policy set but dropped a never-existing name
-- ("Allow authenticated insert deals") instead of this one, so the open
-- policy survived on the live database.
--
-- After this migration, deal inserts require an authenticated user and pass
-- one of the 003_rls.sql insert policies. Every legitimate app flow
-- (app/post inserts as the logged-in owner) is unaffected: verified against
-- the repo, no anonymous insert path exists.
--
-- Safe to apply: DROP ... IF EXISTS is a no-op if the policy is already gone.

DROP POLICY IF EXISTS "Allow business inserts" ON deals;
