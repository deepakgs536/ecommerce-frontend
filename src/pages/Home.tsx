import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Truck, ShieldCheck, Zap, Star, ArrowRight, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductAPI } from '@/api/services';
import { ProductCard } from '@/components/ui/ProductCard';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductAPI.getAll();
        setFeaturedProducts(response.data.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div 
              initial="hidden" animate="visible" variants={staggerContainer}
              className="flex flex-col justify-center space-y-8 text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                <Badge variant="outline" className="py-1.5 px-4 rounded-full border-primary/30 bg-primary/5 text-primary text-sm font-medium backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Spring Collection 2026 is Live
                </Badge>
              </motion.div>
              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight lg:text-8xl">
                  Redefine <br className="hidden lg:block" />
                  <span className="gradient-text">Your Style.</span>
                </h1>
                <p className="max-w-[600px] mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Experience the perfect blend of minimalist design and premium quality. Curated essentials for the modern lifestyle.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/products">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                    Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-background/50 backdrop-blur-md border-border/50 hover:bg-muted/50">
                    Our Story
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mx-auto w-full max-w-[500px] lg:max-w-none relative hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden glass-panel aspect-[4/3] shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop" 
                  alt="Premium Collection" 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                   <div className="text-white">
                      <p className="font-bold text-xl mb-1">Essential Collection</p>
                      <p className="text-white/80 text-sm">Starting at $49.99</p>
                   </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Free Global Delivery</h3>
                <p className="text-sm text-muted-foreground">On all orders above $150</p>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Checkout</h3>
                <p className="text-sm text-muted-foreground">100% protected payments</p>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-background/50 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instant Refunds</h3>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Shop by Category</h2>
              <p className="text-muted-foreground text-lg">Curated collections for your lifestyle</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop' },
              { name: 'Apparel', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop' },
              { name: 'Home & Living', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
              { name: 'Accessories', img: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop' }
            ].map((cat, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <Link to={`/products?category=${cat.name.toLowerCase()}`} className="group block">
                  <Card className="overflow-hidden border-none premium-shadow bg-background h-[300px] relative rounded-2xl">
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity" />
                    <CardContent className="p-6 flex flex-col items-start justify-end h-full relative z-10 text-left">
                      <h3 className="text-2xl font-bold mb-1 text-white">{cat.name}</h3>
                      <span className="text-sm font-medium text-white/80 flex items-center group-hover:text-white transition-colors">
                        Explore <ArrowRight className="ml-1 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Trending Now</h2>
              <p className="text-muted-foreground text-lg">Our most popular items this week</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="rounded-full px-6">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {featuredProducts.map(product => (
                <motion.div key={product.productId} variants={fadeInUp}>
                  <ProductCard 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by Thousands</h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Don't just take our word for it. Here's what our community has to say.</p>
          </motion.div>
          
          <motion.div 
             initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { name: "Sarah Jenkins", role: "Verified Buyer", text: "The quality is absolutely unmatched. I've bought three items so far and each one exceeded my expectations." },
              { name: "Michael Chen", role: "Premium Member", text: "Lightning fast shipping and the packaging felt so premium. Will definitely be shopping here again for gifts." },
              { name: "Emma Rodriguez", role: "Verified Buyer", text: "Customer service was incredibly helpful when I needed to exchange sizes. A truly seamless experience from start to finish." }
            ].map((testimonial, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-primary-foreground/10 p-8 rounded-2xl backdrop-blur-sm border border-primary-foreground/10">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-primary-foreground/70">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="container px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="max-w-3xl mx-auto text-center glass-panel p-8 md:p-16 rounded-3xl"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Join our Newsletter</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex h-12 w-full rounded-full border border-input bg-background px-6 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <Button type="submit" size="lg" className="rounded-full h-12 px-8">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">We respect your privacy. Unsubscribe at any time.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
