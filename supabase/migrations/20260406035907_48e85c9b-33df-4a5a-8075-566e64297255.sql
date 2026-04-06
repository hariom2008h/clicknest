-- Fix 1: Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix 2: Restrict categories write access - drop overly permissive policies
DROP POLICY IF EXISTS "Allow insert on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow update on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow delete on categories" ON public.categories;