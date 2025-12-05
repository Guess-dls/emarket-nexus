-- Create activity_logs table for tracking user activities
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert logs (via triggers/functions)
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_activity(
  _user_id uuid,
  _user_email text,
  _action_type text,
  _description text,
  _metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (user_id, user_email, action_type, description, metadata)
  VALUES (_user_id, _user_email, _action_type, _description, _metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Trigger to log order creation
CREATE OR REPLACE FUNCTION public.log_order_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM public.profiles WHERE id = NEW.id_client;
  
  PERFORM public.log_activity(
    NEW.id_client,
    v_email,
    'purchase',
    'Nouvelle commande créée',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total, 'payment_method', NEW.methode_paiement)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_order_creation
AFTER INSERT ON public.commandes
FOR EACH ROW
EXECUTE FUNCTION public.log_order_creation();

-- Trigger to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    SELECT email INTO v_email FROM public.profiles WHERE id = NEW.id_client;
    
    PERFORM public.log_activity(
      NEW.id_client,
      v_email,
      'order_status_change',
      'Statut de commande changé: ' || OLD.statut || ' → ' || NEW.statut,
      jsonb_build_object('order_id', NEW.id, 'old_status', OLD.statut, 'new_status', NEW.statut)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE ON public.commandes
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- Trigger to log vendor order status changes (shipping, etc.)
CREATE OR REPLACE FUNCTION public.log_vendor_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_email text;
  v_product_name text;
BEGIN
  IF OLD.statut IS DISTINCT FROM NEW.statut THEN
    SELECT email INTO v_vendor_email FROM public.profiles WHERE id = NEW.id_vendeur;
    SELECT nom INTO v_product_name FROM public.produits WHERE id = NEW.id_produit;
    
    PERFORM public.log_activity(
      NEW.id_vendeur,
      v_vendor_email,
      'vendor_order_action',
      'Action vendeur: ' || NEW.statut || ' pour ' || COALESCE(v_product_name, 'produit'),
      jsonb_build_object('order_id', NEW.id_commande, 'product_id', NEW.id_produit, 'status', NEW.statut)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_vendor_order_status
AFTER UPDATE ON public.vendeur_commandes
FOR EACH ROW
EXECUTE FUNCTION public.log_vendor_order_status_change();