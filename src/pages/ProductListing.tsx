import { useEffect, useState } from 'react';
import { ProductAPI, MediaAPI, CartAPI } from '@/api/services';
import { ProductCard } from '@/components/ui/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['All Categories', 'Electronics', 'Apparel', 'Home & Living', 'Accessories'];

export const ProductListing = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') 
    ? searchParams.get('category')!.charAt(0).toUpperCase() + searchParams.get('category')!.slice(1) 
    : 'All Categories';
    
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.find(c => c.toLowerCase() === initialCategory.toLowerCase()) || 'All Categories'
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductAPI.getAll();
        const productsWithSignedUrls = await Promise.all(
          response.data.data.map(async (product: any) => {
            if (!product.image_url) {
              return product;
            }
            try {
              const mediaResponse = await MediaAPI.getDownloadUrl(product.image_url);
              return {
                ...product,
                image_url: mediaResponse.data.url
              };
            } catch (err) {
              return { ...product, image_url: "" };
            }
          })
        );
        setProducts(productsWithSignedUrls);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const { user } = useSelector((state: any) => state.auth);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (product: any) => {
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All Categories') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h1 className="text-3xl font-black tracking-tight">{selectedCategory}</h1>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search for essentials..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 rounded-full border-slate-200 bg-slate-50 focus-visible:ring-slate-200 focus-visible:bg-white transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[400px] w-full rounded-[2rem]" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-6 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.productId} 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-8">
          <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Search className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-3">No products found</h3>
          <p className="text-slate-500 font-medium text-lg">We couldn't find anything matching your current filters.</p>
          <Button 
            variant="outline" 
            className="mt-8 rounded-full px-8 h-12 font-semibold"
            onClick={() => { setSearch(''); handleCategorySelect('All Categories'); }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
