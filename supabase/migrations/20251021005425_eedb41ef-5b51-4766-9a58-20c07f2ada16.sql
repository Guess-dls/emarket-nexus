-- Add foreign key constraints for proper relationships

-- Add foreign key from profiles.id to auth.users.id (if not exists)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key from produits.id_vendeur to profiles.id
ALTER TABLE public.produits
DROP CONSTRAINT IF EXISTS produits_id_vendeur_fkey;

ALTER TABLE public.produits
ADD CONSTRAINT produits_id_vendeur_fkey
FOREIGN KEY (id_vendeur) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from commandes.id_client to profiles.id
ALTER TABLE public.commandes
DROP CONSTRAINT IF EXISTS commandes_id_client_fkey;

ALTER TABLE public.commandes
ADD CONSTRAINT commandes_id_client_fkey
FOREIGN KEY (id_client) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from user_roles.user_id to profiles.id
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from commande_items.id_commande to commandes.id
ALTER TABLE public.commande_items
DROP CONSTRAINT IF EXISTS commande_items_id_commande_fkey;

ALTER TABLE public.commande_items
ADD CONSTRAINT commande_items_id_commande_fkey
FOREIGN KEY (id_commande) REFERENCES public.commandes(id) ON DELETE CASCADE;

-- Add foreign key from commande_items.id_produit to produits.id
ALTER TABLE public.commande_items
DROP CONSTRAINT IF EXISTS commande_items_id_produit_fkey;

ALTER TABLE public.commande_items
ADD CONSTRAINT commande_items_id_produit_fkey
FOREIGN KEY (id_produit) REFERENCES public.produits(id) ON DELETE SET NULL;

-- Add foreign key from avis to profiles and produits
ALTER TABLE public.avis
DROP CONSTRAINT IF EXISTS avis_id_client_fkey;

ALTER TABLE public.avis
ADD CONSTRAINT avis_id_client_fkey
FOREIGN KEY (id_client) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.avis
DROP CONSTRAINT IF EXISTS avis_id_produit_fkey;

ALTER TABLE public.avis
ADD CONSTRAINT avis_id_produit_fkey
FOREIGN KEY (id_produit) REFERENCES public.produits(id) ON DELETE CASCADE;

-- Add foreign key from vendeur_commandes
ALTER TABLE public.vendeur_commandes
DROP CONSTRAINT IF EXISTS vendeur_commandes_id_vendeur_fkey;

ALTER TABLE public.vendeur_commandes
ADD CONSTRAINT vendeur_commandes_id_vendeur_fkey
FOREIGN KEY (id_vendeur) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.vendeur_commandes
DROP CONSTRAINT IF EXISTS vendeur_commandes_id_commande_fkey;

ALTER TABLE public.vendeur_commandes
ADD CONSTRAINT vendeur_commandes_id_commande_fkey
FOREIGN KEY (id_commande) REFERENCES public.commandes(id) ON DELETE CASCADE;

ALTER TABLE public.vendeur_commandes
DROP CONSTRAINT IF EXISTS vendeur_commandes_id_produit_fkey;

ALTER TABLE public.vendeur_commandes
ADD CONSTRAINT vendeur_commandes_id_produit_fkey
FOREIGN KEY (id_produit) REFERENCES public.produits(id) ON DELETE CASCADE;

-- Add foreign key from panier
ALTER TABLE public.panier
DROP CONSTRAINT IF EXISTS panier_id_utilisateur_fkey;

ALTER TABLE public.panier
ADD CONSTRAINT panier_id_utilisateur_fkey
FOREIGN KEY (id_utilisateur) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.panier
DROP CONSTRAINT IF EXISTS panier_id_produit_fkey;

ALTER TABLE public.panier
ADD CONSTRAINT panier_id_produit_fkey
FOREIGN KEY (id_produit) REFERENCES public.produits(id) ON DELETE CASCADE;

-- Add foreign key from notifications
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_id_utilisateur_fkey;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_id_utilisateur_fkey
FOREIGN KEY (id_utilisateur) REFERENCES public.profiles(id) ON DELETE CASCADE;