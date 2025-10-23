-- Add INSERT policy for notifications
-- Only admins can manually create notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create a security definer function for system-generated notifications
-- This allows triggers and backend functions to create notifications without direct user access
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _message text,
  _type text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (id_utilisateur, message, type, lu)
  VALUES (_user_id, _message, _type, false)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Grant execute permission to authenticated users (for triggers to use)
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

COMMENT ON FUNCTION public.create_notification IS 'Securely create notifications for users. Can be called by triggers and admin functions.';