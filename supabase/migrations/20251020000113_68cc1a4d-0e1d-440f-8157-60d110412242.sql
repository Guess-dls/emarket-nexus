-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Clients can delete own pending orders" ON public.commandes;

-- Create new policy allowing deletion of pending, canceled, and delivered orders
CREATE POLICY "Clients can delete own orders" 
ON public.commandes 
FOR DELETE 
USING (
  auth.uid() = id_client 
  AND statut IN ('en_attente', 'annulee', 'livree')
);