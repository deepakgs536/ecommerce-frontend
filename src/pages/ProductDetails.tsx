import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductAPI, MediaAPI, CartAPI } from '@/api/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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
    dispatch(addToCart({ ...product, quantity }));
    
    // Sync with backend if logged in
    if (user?.id) {
      try {
        await CartAPI.addItem(user.id, {
          productId: product.productId,
          name: product.name,
          price: Number(product.price),
          quantity: quantity,
          image_url: product.image_url
        });
      } catch (error: any) {
        console.error('Failed to sync cart with backend:', error?.response?.data || error);
      }
    }
    
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-6xl">
        <Skeleton className="h-6 w-32 mb-8 rounded-full" />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <Skeleton className="aspect-square w-full rounded-[2rem]" />
          <div className="space-y-8 pt-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4 rounded-full" />
              <Skeleton className="h-12 w-3/4 rounded-xl" />
              <Skeleton className="h-8 w-1/3 rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-32 text-center max-w-md">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-8 w-8 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Product not found</h2>
          <p className="text-slate-500 mb-8 font-medium">This product might have been removed or the link is invalid.</p>
          <Link to="/products" className="w-full">
            <Button className="w-full rounded-full h-12 font-semibold">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6 max-w-7xl">
      <Link 
        to="/products" 
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-8 bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 backdrop-blur-md"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Link>
      
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative aspect-[4/5] lg:aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 border border-slate-100 group"
        >
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&q=80'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.stock_status !== 'IN_STOCK' && (
            <div className="absolute top-6 right-6">
              <Badge variant="destructive" className="px-4 py-1.5 text-sm font-bold shadow-lg backdrop-blur-md bg-red-500/90">
                Out of Stock
              </Badge>
            </div>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="space-y-8 lg:py-8"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide">
                {product.category || 'General'}
              </Badge>
              <span className="text-sm font-medium text-slate-400">SKU: {product.productId?.substring(0,8).toUpperCase()}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-primary">${Number(product.price).toFixed(2)}</p>
              <span className="text-lg font-semibold text-slate-400 line-through decoration-slate-300">${(Number(product.price) * 1.2).toFixed(2)}</span>
            </div>
          </div>
          
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            {product.description || "Experience the perfect blend of style and functionality. Crafted with premium materials to ensure durability and aesthetic appeal."}
          </p>
          
          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Quantity</span>
              <div className="flex items-center bg-white rounded-full border border-slate-200 shadow-sm p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-600"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock_status !== 'IN_STOCK'}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-600"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock_status !== 'IN_STOCK'}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all duration-300" 
              disabled={product.stock_status !== 'IN_STOCK'}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock_status === 'IN_STOCK' ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

          {/* Premium Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <Truck className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Free Shipping</h4>
              <p className="text-xs text-slate-500 mt-1">On orders over $50</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <RefreshCcw className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">30-Day Returns</h4>
              <p className="text-xs text-slate-500 mt-1">No questions asked</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-1">100% encrypted</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
