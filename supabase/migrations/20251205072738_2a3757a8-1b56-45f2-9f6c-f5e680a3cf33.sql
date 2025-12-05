-- Add new columns to banners table for category, sub-images, and expiration
ALTER TABLE public.banners
ADD COLUMN id_categorie uuid REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN sub_images text[] DEFAULT '{}'::text[],
ADD COLUMN expires_at timestamp with time zone;

-- Create index for faster expiration queries
CREATE INDEX idx_banners_expires_at ON public.banners(expires_at) WHERE expires_at IS NOT NULL;