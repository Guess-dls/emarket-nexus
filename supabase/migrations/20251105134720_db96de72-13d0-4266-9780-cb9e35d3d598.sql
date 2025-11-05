-- Create featured products table
CREATE TABLE public.produits_vedettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_produit uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1 AND position <= 10),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(id_produit),
  UNIQUE(position)
);

-- Enable RLS
ALTER TABLE public.produits_vedettes ENABLE ROW LEVEL SECURITY;

-- Anyone can view featured products
CREATE POLICY "Anyone can view featured products"
ON public.produits_vedettes
FOR SELECT
USING (true);

-- Only admins can manage featured products
CREATE POLICY "Admins can manage featured products"
ON public.produits_vedettes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_produits_vedettes_position ON public.produits_vedettes(position);

COMMENT ON TABLE public.produits_vedettes IS 'Stores admin-selected featured products for homepage carousel';