import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ShoppingCart } from 'lucide-react';

interface Product {
  productId: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock_status: string;
}

export const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) => {
  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
      <Link to={`/products/${product.productId}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80'} 
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {product.stock_status !== 'IN_STOCK' && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
            <Link to={`/products/${product.productId}`}>
              <h3 className="font-semibold line-clamp-2 hover:underline">{product.name}</h3>
            </Link>
          </div>
          <p className="font-bold whitespace-nowrap">${product.price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          disabled={product.stock_status !== 'IN_STOCK'}
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
