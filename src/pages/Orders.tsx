import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { OrderAPI } from '@/api/services';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const Orders = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user?.id) {
          const response = await OrderAPI.getUserOrders(user.id);
          setOrders(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-48 mb-8" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="text-primary hover:underline">Start Shopping</Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.orderId} to={`/orders/${order.orderId}`} className="block">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer premium-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Order #{order.orderId}
                  </CardTitle>
                  <Badge variant={order.status === 'PAID' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'Recently'}
                    </span>
                    <span className="font-bold">${order.total_amount?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
