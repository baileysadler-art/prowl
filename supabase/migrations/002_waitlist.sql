-- ============================================================================
-- Waitlist table for pre-launch email capture
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'landing_page',
  created_at timestamptz DEFAULT now()
);

-- Allow anonymous inserts (no auth required for waitlist signups)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only service role can read waitlist entries
CREATE POLICY "Service role can read waitlist"
  ON public.waitlist FOR SELECT
  USING (auth.role() = 'service_role');
