-- Ajouter le statut 'suspendu' aux statuts autorisés pour les produits
ALTER TABLE public.produits DROP CONSTRAINT IF EXISTS produits_statut_check;

ALTER TABLE public.produits ADD CONSTRAINT produits_statut_check 
CHECK (statut IN ('brouillon', 'en_ligne', 'suspendu'));