CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
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

CREATE POLICY "Allow public read access on businesses" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on live deals" ON deals
  FOR SELECT USING (expires_at > now());

CREATE POLICY "Allow business inserts" ON deals
  FOR INSERT WITH CHECK (true);
