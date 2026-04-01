
ALTER TABLE public.messages ADD COLUMN user_tag text NOT NULL DEFAULT '0000';

CREATE POLICY "Anyone can delete messages" ON public.messages FOR DELETE TO public USING (true);

CREATE TABLE public.muted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tag text NOT NULL,
  muted_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read muted" ON public.muted_users FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert muted" ON public.muted_users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete muted" ON public.muted_users FOR DELETE TO public USING (true);
