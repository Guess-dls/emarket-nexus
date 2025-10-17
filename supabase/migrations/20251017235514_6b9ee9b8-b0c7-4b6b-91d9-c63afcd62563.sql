-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'vendeur', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'en_attente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_vendeur UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_categorie UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  statut TEXT DEFAULT 'brouillon' CHECK (statut IN ('en_ligne', 'brouillon', 'rupture')),
  ventes_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart table
CREATE TABLE public.panier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_produit UUID REFERENCES public.produits(id) ON DELETE CASCADE NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (id_utilisateur, id_produit)
);

-- Create orders table
CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_client UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'expediee', 'livree', 'annulee')),
  methode_paiement TEXT CHECK (methode_paiement IN ('carte', 'paypal', 'livraison')),
  adresse_livraison TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.commande_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_commande UUID REFERENCES public.commandes(id) ON DELETE CASCADE NOT NULL,
  id_produit UUID REFERENCES public.produits(id) ON DELETE SET NULL,
  quantite INTEGER NOT NULL CHECK (quantite > 0),
  prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'succes', 'alerte', 'erreur')),
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_produit UUID REFERENCES public.produits(id) ON DELETE CASCADE NOT NULL,
  id_client UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (id_produit, id_client)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND statut = 'actif'
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for produits
CREATE POLICY "Anyone can view online products" ON public.produits FOR SELECT USING (statut = 'en_ligne' OR auth.uid() = id_vendeur OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can insert own products" ON public.produits FOR INSERT WITH CHECK (auth.uid() = id_vendeur AND public.has_role(auth.uid(), 'vendeur'));
CREATE POLICY "Sellers can update own products" ON public.produits FOR UPDATE USING (auth.uid() = id_vendeur);
CREATE POLICY "Admins can manage all products" ON public.produits FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for panier
CREATE POLICY "Users can manage own cart" ON public.panier FOR ALL USING (auth.uid() = id_utilisateur);

-- RLS Policies for commandes
CREATE POLICY "Clients can view own orders" ON public.commandes FOR SELECT USING (auth.uid() = id_client);
CREATE POLICY "Clients can create orders" ON public.commandes FOR INSERT WITH CHECK (auth.uid() = id_client);
CREATE POLICY "Admins can view all orders" ON public.commandes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for commande_items
CREATE POLICY "Users can view own order items" ON public.commande_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.commandes WHERE id = id_commande AND id_client = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.commande_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = id_utilisateur);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = id_utilisateur);

-- RLS Policies for avis
CREATE POLICY "Anyone can view reviews" ON public.avis FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON public.avis FOR INSERT WITH CHECK (auth.uid() = id_client);
CREATE POLICY "Users can update own reviews" ON public.avis FOR UPDATE USING (auth.uid() = id_client);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    NEW.email
  );
  
  -- Insert default role from metadata or default to 'client'
  INSERT INTO public.user_roles (user_id, role, statut)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client'),
    CASE 
      WHEN COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client') = 'vendeur' THEN 'en_attente'
      ELSE 'actif'
    END
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_produits
  BEFORE UPDATE ON public.produits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (nom, slug, description) VALUES
  ('Électronique', 'electronique', 'Smartphones, ordinateurs et accessoires'),
  ('Mode', 'mode', 'Vêtements, chaussures et accessoires'),
  ('Maison', 'maison', 'Meubles et décoration'),
  ('Beauté', 'beaute', 'Produits de beauté et soins'),
  ('Sports', 'sports', 'Équipements sportifs et fitness'),
  ('Livres', 'livres', 'Livres et magazines');