CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
  ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;

ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS affiliate_earned BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read own affiliate rows" ON affiliates;
CREATE POLICY "Allow users to read own affiliate rows" ON affiliates
  FOR SELECT TO authenticated USING (auth.uid() = referrer_user_id);

DROP POLICY IF EXISTS "Allow authenticated insert affiliates" ON affiliates;
CREATE POLICY "Allow authenticated insert affiliates" ON affiliates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_user_id);
