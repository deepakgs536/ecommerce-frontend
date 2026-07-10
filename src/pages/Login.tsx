import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && (isLogin || name)) {
      const role = email.includes('admin') ? 'admin' : 'customer';
      const user = { 
        id: 'u_1', 
        name: isLogin ? 'Test User' : name, 
        email, 
        role: role as 'admin' | 'customer' 
      };
      const token = 'mock_jwt_token_xyz';

      dispatch(loginSuccess({ user, token }));
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA]">
      <div className={`flex w-full h-full flex-col lg:flex-row ${!isLogin ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* Aesthetic Image Panel (Slides Left/Right on Desktop) */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          className="hidden lg:block lg:w-1/2 relative h-full p-4"
        >
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900">
            <AnimatePresence initial={false}>
              {isLogin ? (
                <motion.img 
                  key="login-img"
                  src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop" 
                  alt="Login Aesthetic"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <motion.img 
                  key="signup-img"
                  src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop" 
                  alt="Signup Aesthetic"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
            
            <motion.div 
              layout 
              className="absolute bottom-12 left-12 right-12 text-white"
            >
              <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-sm font-semibold mb-6 shadow-sm border border-white/10">
                <Sparkles className="mr-2 h-4 w-4 text-amber-300" />
                {isLogin ? "Welcome back" : "Join the ecosystem"}
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
                {isLogin ? "Curated essentials for modern living." : "Elevate your everyday experience."}
              </h2>
              <p className="text-slate-200 font-medium text-lg max-w-md">
                {isLogin 
                  ? "Access your exclusive collections, faster checkout, and personalized recommendations."
                  : "Create an account to track orders, save favorites, and unlock member-only benefits."
                }
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Form Panel (Slides Right/Left on Desktop) */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          className="w-full lg:w-1/2 h-full flex flex-col justify-center overflow-y-auto px-6 py-12 lg:px-24 scrollbar-hide"
        >
          <div className="w-full max-w-md mx-auto">
            
            <motion.div layout="position" className="text-center lg:text-left mb-5">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                {isLogin ? 'Enter your details to access your account.' : 'Join us to get started with your journey.'}
              </p>
            </motion.div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 lg:h-14 bg-white border-slate-200 rounded-xl px-4 focus-visible:ring-slate-300"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout="position" className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 lg:h-14 bg-white border-slate-200 rounded-xl px-4 focus-visible:ring-slate-300"
                  required
                />
              </motion.div>
              
              <motion.div layout="position" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                  {isLogin && <a href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Forgot password?</a>}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 lg:h-14 bg-white border-slate-200 rounded-xl px-4 focus-visible:ring-slate-300"
                  required
                />
              </motion.div>

              <motion.div layout="position" className="pt-2">
                <Button type="submit" className="w-full h-12 lg:h-14 rounded-xl text-base font-bold shadow-lg shadow-slate-200 hover:-translate-y-0.5 transition-transform group">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </form>

            <motion.div layout="position">
              <div className="relative my-8">
                
              </div>

              <p className="text-center text-slate-500 font-medium mt-8">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-900 font-bold hover:underline transition-all focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};
