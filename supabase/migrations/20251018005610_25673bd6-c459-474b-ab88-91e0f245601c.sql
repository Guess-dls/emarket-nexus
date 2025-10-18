-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Vendeurs peuvent uploader leurs images" ON storage.objects;
DROP POLICY IF EXISTS "Images publiques visibles" ON storage.objects;
DROP POLICY IF EXISTS "Vendeurs peuvent mettre à jour leurs images" ON storage.objects;
DROP POLICY IF EXISTS "Vendeurs peuvent supprimer leurs images" ON storage.objects;

-- Politique pour permettre aux vendeurs d'uploader des images
CREATE POLICY "Vendeurs peuvent uploader leurs images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'vendeur'::app_role)
);

-- Politique pour voir les images (bucket public)
CREATE POLICY "Images publiques visibles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Politique pour mettre à jour ses propres images
CREATE POLICY "Vendeurs peuvent mettre à jour leurs images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'vendeur'::app_role)
);

-- Politique pour supprimer ses propres images
CREATE POLICY "Vendeurs peuvent supprimer leurs images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND has_role(auth.uid(), 'vendeur'::app_role)
);