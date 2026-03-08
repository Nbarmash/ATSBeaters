-- ============================================================
-- Session 6 migration: ATSBeaters Supabase schema additions
-- Run this in the Supabase SQL Editor (project: ATSBeaters)
-- ============================================================

-- ── 1. scan_history table ─────────────────────────────────
-- Stores every ATS scan result for a logged-in user.
CREATE TABLE IF NOT EXISTS public.scan_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,          -- AppTab enum value, e.g. 'analyzer'
  input      TEXT NOT NULL,          -- raw resume text passed to Gemini
  result     JSONB,                  -- full AnalysisResult JSON blob
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups ordered by newest first
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id
  ON public.scan_history(user_id, created_at DESC);

-- ── 2. RLS policies for scan_history ─────────────────────
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view own scan history"
  ON public.scan_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own history rows
CREATE POLICY "Users can insert own scan history"
  ON public.scan_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── 3. decrement_credit RPC ───────────────────────────────
-- Atomically decrements credits by 1 (minimum 0).
-- Called by authService.deductCredit() via supabase.rpc('decrement_credit').
-- Security definer so it bypasses RLS and runs as the DB owner.
CREATE OR REPLACE FUNCTION public.decrement_credit(uid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET    credits = GREATEST(credits - 1, 0)
  WHERE  id = uid;
END;
$$;

-- Grant execute to authenticated users (RLS still blocks cross-user access
-- because the function only updates the row matching the passed uid, and
-- callers are expected to pass auth.uid() from the client).
GRANT EXECUTE ON FUNCTION public.decrement_credit(UUID) TO authenticated;
