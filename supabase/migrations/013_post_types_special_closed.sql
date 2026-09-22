-- Captain-run later. Do not apply from the agent.
-- Extends deals.post_type CHECK for special + closed_early.

ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_post_type_check;

ALTER TABLE deals
  ADD CONSTRAINT deals_post_type_check
  CHECK (post_type IN ('deal', 'open', 'special', 'closed_early'));
