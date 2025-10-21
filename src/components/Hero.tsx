import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Meilleur Marketplace  en Côte D'Ivoire
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Découvrez des{" "}
            <span className="text-accent font-semibold">
              produits exceptionnels
            </span>

            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Des milliers de produits de qualité, vendus par des vendeurs vérifiés. 
              Achetez en toute confiance avec Dmarket.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity group"
                asChild
              >
                <Link to="/products">
                  Explorer les produits
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link to="/sell">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Devenir vendeur
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Produits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Vendeurs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Clients satisfaits</div>
              </div>
            </div>
          </div>

          {/* Image placeholder - will be replaced with actual product showcase */}
          <div className="relative animate-slide-up">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-32 w-32 text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements - removed blur for crisp text display */}
    </section>
  );
};

export default Hero;
