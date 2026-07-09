import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { OrderAPI } from '@/api/services';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export const Checkout = () => {
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await OrderAPI.create({
        userId: user?.id,
        shipping_address: shipping,
        items,
        total_amount: totalAmount
      });
      
      const orderId = response.data.data.orderId;
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      
      // Navigate to payment simulator
      navigate(`/payments/pending?orderId=${orderId}`);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="premium-shadow">
            <form onSubmit={handleCheckout}>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input 
                    required 
                    value={shipping.street} 
                    onChange={e => setShipping({ ...shipping, street: e.target.value })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input 
                      required 
                      value={shipping.city} 
                      onChange={e => setShipping({ ...shipping, city: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input 
                      required 
                      value={shipping.state} 
                      onChange={e => setShipping({ ...shipping, state: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="space-y-2 w-1/2">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input 
                    required 
                    value={shipping.zip} 
                    onChange={e => setShipping({ ...shipping, zip: e.target.value })} 
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-6">
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Place Order & Pay'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div>
          <Card className="premium-shadow">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity} x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
