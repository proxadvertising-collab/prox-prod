CREATE TABLE IF NOT EXISTS worldwide_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS price_display text,
  ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'en';
