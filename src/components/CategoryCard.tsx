import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  productCount: number;
  slug: string;
}

const CategoryCard = ({ name, icon: Icon, productCount, slug }: CategoryCardProps) => {
  return (
    <Link to={`/category/${slug}`}>
      <Card className="group cursor-pointer card-hover border-border/50 overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:shadow-primary transition-all duration-300 group-hover:rotate-3">
            <Icon className="h-8 w-8 text-primary group-hover:text-primary transition-colors" />
          </div>
          
          <div className="relative">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {productCount} produits
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
