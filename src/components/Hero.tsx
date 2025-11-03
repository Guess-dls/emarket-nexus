import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="container py-20 md:py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-scale-in backdrop-blur-sm border border-primary/20">
              <TrendingUp className="h-4 w-4" />
              Meilleur Marketplace  en Côte D'Ivoire
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Découvrez des{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                produits exceptionnels
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Des milliers de produits de qualité, vendus par des vendeurs vérifiés. 
              Achetez en toute confiance avec DanMaket.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                variant="premium"
                className="group shadow-primary"
                onClick={() => {
                  const productsSection = document.querySelector('section:nth-of-type(2)');
                  productsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explorer les produits
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button size="lg" variant="outline" className="group border-primary/30" asChild>
                <Link to="/auth">
                  <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Devenir vendeur
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div className="space-y-1 group">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform">10K+</div>
                <div className="text-sm text-muted-foreground">Produits</div>
              </div>
              <div className="space-y-1 group">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform">5K+</div>
                <div className="text-sm text-muted-foreground">Vendeurs</div>
              </div>
              <div className="space-y-1 group">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform">50K+</div>
                <div className="text-sm text-muted-foreground">Clients satisfaits</div>
              </div>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative animate-slide-up">
            <div className="aspect-square rounded-2xl glass-effect overflow-hidden shadow-elegant">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-32 w-32 text-primary/30 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
