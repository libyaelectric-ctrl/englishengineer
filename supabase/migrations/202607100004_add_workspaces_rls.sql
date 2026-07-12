-- Workspaces table with full RLS protection
-- This migration ensures the workspaces table exists with proper security policies.

-- Create table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Workspace',
  memory JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can insert own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Service role manages all workspaces" ON public.workspaces;

-- Users can only view their own workspaces
CREATE POLICY "Users can view own workspaces"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert workspaces for themselves
CREATE POLICY "Users can insert own workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own workspaces
CREATE POLICY "Users can update own workspaces"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Users can delete their own workspaces
CREATE POLICY "Users can delete own workspaces"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Service role bypasses RLS (for backend operations)
CREATE POLICY "Service role manages all workspaces"
  ON public.workspaces FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces (user_id);
