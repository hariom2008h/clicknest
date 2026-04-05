CREATE POLICY "Allow insert on categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update on categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete on categories" ON public.categories FOR DELETE TO authenticated USING (true);