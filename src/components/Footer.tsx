import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Dmarket
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Votre marketplace de confiance pour acheter et vendre en ligne.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="mailto:ninopaket@gmail.com" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Boutique</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Tous les produits</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Catégories</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Mon panier</Link></li>
              <li><Link to="/checkout" className="hover:text-primary transition-colors">Commander</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">Aide</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:ninopaket@gmail.com" className="hover:text-primary transition-colors">Contact</a></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/client-dashboard" className="hover:text-primary transition-colors">Mes commandes</Link></li>
              <li><Link to="/seller-dashboard" className="hover:text-primary transition-colors">Espace vendeur</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-4">Mon Compte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-primary transition-colors">Connexion</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Inscription</Link></li>
              <li><Link to="/client-dashboard" className="hover:text-primary transition-colors">Tableau de bord</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Mon panier</Link></li>
            </ul>
            <div className="mt-6">
              <a 
                href="mailto:ninopaket@gmail.com" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                📧 Nous écrire
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Dmarket. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
