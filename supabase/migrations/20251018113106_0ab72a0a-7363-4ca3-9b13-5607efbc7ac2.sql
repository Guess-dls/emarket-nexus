-- Update RLS policy for commandes deletion and updates
DROP POLICY IF EXISTS "Clients can delete own pending orders" ON public.commandes;
DROP POLICY IF EXISTS "Clients can cancel own orders" ON public.commandes;

CREATE POLICY "Clients can delete own pending orders" 
ON public.commandes 
FOR DELETE 
USING (
  auth.uid() = id_client 
  AND statut = 'en_attente'
);

CREATE POLICY "Clients can cancel own orders" 
ON public.commandes 
FOR UPDATE 
USING (
  auth.uid() = id_client 
  AND statut IN ('en_attente', 'en_cours')
)
WITH CHECK (
  auth.uid() = id_client
);