import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductAPI, MediaAPI, CartAPI } from '@/api/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const response = await ProductAPI.getById(id);
          const product = response.data.data;

          if (product.image_url) {
            try {
              const mediaResponse = await MediaAPI.getDownloadUrl(product.image_url);

              product.image_url = mediaResponse.data.url;
            } catch (error) {
              console.error("Failed to generate signed image URL", error);
              product.image_url = "";
            }
          }

          setProduct(product);
        }
      } catch (error) {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    dispatch(addToCart(product));
    
    // Sync with backend if logged in
    if (user?.id) {
      try {
        await CartAPI.addItem(user.id, {
          productId: product.productId,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          image_url: product.image_url
        });
      } catch (error: any) {
        console.error('Failed to sync cart with backend:', error?.response?.data || error);
      }
    }
    
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="aspect-square bg-muted rounded-2xl overflow-hidden premium-shadow">
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80'} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-4">{product.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
            <p className="text-3xl font-semibold text-primary/80">${product.price.toFixed(2)}</p>
          </div>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          
          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium text-sm">Status:</span>
              {product.stock_status === 'IN_STOCK' ? (
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">In Stock</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            
            <Button 
              size="lg" 
              className="w-full md:w-auto text-lg px-8 h-14" 
              disabled={product.stock_status !== 'IN_STOCK'}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
