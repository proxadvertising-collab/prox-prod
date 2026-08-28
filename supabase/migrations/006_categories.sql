-- Add categories array to deals (max 2 values enforced in app layer)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Optional: constrain to allowed category values and max 2 entries
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_categories_check;
ALTER TABLE deals ADD CONSTRAINT deals_categories_check CHECK (
  array_length(categories, 1) IS NULL OR array_length(categories, 1) <= 2
);
