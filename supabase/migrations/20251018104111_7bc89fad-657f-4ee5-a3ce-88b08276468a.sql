-- Update existing pending sellers to active status
UPDATE user_roles 
SET statut = 'actif' 
WHERE role = 'vendeur' AND statut = 'en_attente';

-- Update the handle_new_user function to make all sellers active by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    NEW.email
  );
  
  -- Insert default role from metadata or default to 'client'
  -- All users including sellers are now active by default
  INSERT INTO public.user_roles (user_id, role, statut)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client'),
    'actif'
  );
  
  RETURN NEW;
END;
$function$;
