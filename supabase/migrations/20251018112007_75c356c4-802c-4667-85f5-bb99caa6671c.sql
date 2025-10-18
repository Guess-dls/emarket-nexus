-- Trigger to manage stock and vendor links when adding order items
CREATE OR REPLACE FUNCTION public.after_commande_item_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vendeur uuid;
  v_stock integer;
BEGIN
  -- Lock product row to prevent race conditions
  SELECT stock, id_vendeur INTO v_stock, v_vendeur
  FROM public.produits
  WHERE id = NEW.id_produit
  FOR UPDATE;

  IF v_stock IS NULL THEN
    RAISE EXCEPTION 'Produit introuvable';
  END IF;

  IF NEW.quantite <= 0 THEN
    RAISE EXCEPTION 'Quantité invalide';
  END IF;

  IF v_stock < NEW.quantite THEN
    RAISE EXCEPTION 'Stock insuffisant';
  END IF;

  -- Update stock and sales
  UPDATE public.produits
  SET stock = stock - NEW.quantite,
      ventes_total = COALESCE(ventes_total, 0) + NEW.quantite,
      updated_at = now()
  WHERE id = NEW.id_produit;

  -- Create or update vendor order linkage
  INSERT INTO public.vendeur_commandes (
    id_vendeur, id_commande, id_produit, quantite, prix_unitaire, statut
  )
  VALUES (
    v_vendeur, NEW.id_commande, NEW.id_produit, NEW.quantite, NEW.prix_unitaire, 'en_attente'
  )
  ON CONFLICT (id_vendeur, id_commande, id_produit)
  DO UPDATE SET
    quantite = public.vendeur_commandes.quantite + EXCLUDED.quantite,
    prix_unitaire = EXCLUDED.prix_unitaire;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_commande_item_insert ON public.commande_items;
CREATE TRIGGER trg_after_commande_item_insert
AFTER INSERT ON public.commande_items
FOR EACH ROW
EXECUTE FUNCTION public.after_commande_item_insert();