-- Ensure the product-images bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- Recreate storage policies idempotently for product-images
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

-- Public can read product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Authenticated users can upload to their own folder (prefix is user id)
CREATE POLICY "Users can upload their own product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can update their own images
CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can delete their own images
CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
