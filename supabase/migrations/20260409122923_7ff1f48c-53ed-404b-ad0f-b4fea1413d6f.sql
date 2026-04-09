
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Service role can upload product images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role can delete product images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'product-images');
