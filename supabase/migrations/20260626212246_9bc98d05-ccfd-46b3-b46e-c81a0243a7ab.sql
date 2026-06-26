
-- Paystack credentials: stored server-side, never returned to clients
CREATE TABLE public.paystack_settings (
  id INT PRIMARY KEY DEFAULT 1,
  secret_key TEXT,
  public_key TEXT,
  mode TEXT NOT NULL DEFAULT 'test',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  CHECK (id = 1)
);
GRANT ALL ON public.paystack_settings TO service_role;
-- Intentionally NO grants to anon/authenticated: only service_role (and server fns
-- using the admin client) may touch this table. Admin dashboard reads/writes go
-- through gated server functions.
ALTER TABLE public.paystack_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.paystack_settings (id) VALUES (1);

-- Auto-promote the very first signup to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
