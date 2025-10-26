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
      <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
            <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{name}</h3>
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
