import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  seller: string;
  badge?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  seller,
  badge,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden card-hover border-border/50">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {badge && (
            <Badge className="absolute top-3 left-3 bg-gradient-primary text-white shadow-primary animate-scale-in">
              {badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-gradient-accent text-white shadow-lg animate-scale-in">
              -{discount}%
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 glass-effect hover:scale-110"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors leading-snug">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 text-sm">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 transition-colors ${
                  i < Math.floor(rating)
                    ? "fill-primary text-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">({reviews})</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Par {seller}
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {price.toFixed(2)}€
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(2)}€
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          variant="premium"
          className="w-full group shadow-elegant"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(id);
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
