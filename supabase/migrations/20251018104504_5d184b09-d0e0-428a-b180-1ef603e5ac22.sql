-- Insert default categories if they don't exist
INSERT INTO public.categories (nom, slug, description) VALUES
  ('Électronique', 'electronique', 'Smartphones, tablettes et accessoires électroniques'),
  ('Ordinateurs', 'ordinateurs', 'PC, laptops et équipements informatiques'),
  ('Montres', 'montres', 'Montres connectées et classiques'),
  ('Audio', 'audio', 'Écouteurs, casques et équipements audio'),
  ('Photo', 'photo', 'Appareils photo et accessoires'),
  ('Gaming', 'gaming', 'Consoles, jeux vidéo et accessoires gaming'),
  ('Mode', 'mode', 'Vêtements, chaussures et accessoires'),
  ('Maison', 'maison', 'Décoration, meubles et équipements pour la maison')
ON CONFLICT (slug) DO NOTHING;
