CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  price_display TEXT,
  currency_code TEXT DEFAULT 'USD',
  language_code TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function and trigger to ensure 1 live ad per business
CREATE OR REPLACE FUNCTION check_single_live_ad()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM deals
    WHERE business_id = NEW.business_id
      AND expires_at > now()
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Business already has an active live ad.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_live_ad ON deals;
CREATE TRIGGER enforce_single_live_ad
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION check_single_live_ad();

-- RLS Policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on businesses" ON businesses;
CREATE POLICY "Allow public read access on businesses" ON businesses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert businesses" ON businesses;
CREATE POLICY "Allow authenticated insert businesses" ON businesses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owners to update own businesses" ON businesses;
CREATE POLICY "Allow owners to update own businesses" ON businesses
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owners to delete own businesses" ON businesses;
CREATE POLICY "Allow owners to delete own businesses" ON businesses
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow public read access on live deals" ON deals;
CREATE POLICY "Allow public read access on live deals" ON deals
  FOR SELECT USING (expires_at > now());

DROP POLICY IF EXISTS "Allow authenticated insert deals" ON deals;
CREATE POLICY "Allow authenticated insert deals" ON deals
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = deals.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow owners to update own deals" ON deals;
CREATE POLICY "Allow owners to update own deals" ON deals
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = deals.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow owners to delete own deals" ON deals;
CREATE POLICY "Allow owners to delete own deals" ON deals
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = deals.business_id
        AND businesses.owner_id = auth.uid()
    )
  );
