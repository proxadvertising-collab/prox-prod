ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS instagram_url text, 
  ADD COLUMN IF NOT EXISTS facebook_url text, 
  ADD COLUMN IF NOT EXISTS tiktok_url text, 
  ADD COLUMN IF NOT EXISTS yelp_url text, 
  ADD COLUMN IF NOT EXISTS google_maps_url text, 
  ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'deal' CHECK (post_type IN ('deal','open')), 
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE deals 
  ALTER COLUMN expires_at DROP NOT NULL;
