import { useEffect, useState } from 'react';
import { OrderAPI } from '@/api/services';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PackageCheck, Truck, X } from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrderAPI.getAllOrders();
      // sort by date descending
      const sortedOrders = response.data.data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await OrderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order ${orderId} marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
      case 'PAID': return <Badge className="bg-blue-500 hover:bg-blue-600">Paid</Badge>;
      case 'SHIPPED': return <Badge className="bg-purple-500 hover:bg-purple-600">Shipped</Badge>;
      case 'DELIVERED': return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-1">View and process customer orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="premium-shadow border-none bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : orders.length}</div>
          </CardContent>
        </Card>
        <Card className="premium-shadow border-none bg-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">To Process (Paid)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              {loading ? '-' : orders.filter(o => o.status === 'PAID').length}
            </div>
          </CardContent>
        </Card>
        <Card className="premium-shadow border-none bg-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {loading ? '-' : orders.filter(o => o.status === 'SHIPPED').length}
            </div>
          </CardContent>
        </Card>
        <Card className="premium-shadow border-none bg-green-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {loading ? '-' : `$${orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-shadow">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer / Shipping</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow 
                      key={order.orderId}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-mono text-xs">{order.orderId.substring(0, 8)}...</TableCell>
                      <TableCell>{order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">User: {order.userId}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {order.shipping_address ? `${order.shipping_address.city}, ${order.shipping_address.state}` : 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">${(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {order.status === 'PAID' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            disabled={updating === order.orderId}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order.orderId, 'SHIPPED');
                            }}
                          >
                            <Truck className="h-4 w-4 mr-1" /> Ship
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            disabled={updating === order.orderId}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(order.orderId, 'DELIVERED');
                            }}
                          >
                            <PackageCheck className="h-4 w-4 mr-1" /> Deliver
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-2xl border-0 ring-1 ring-border/50 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between sticky top-0 z-10 backdrop-blur-md">
              <div>
                <CardTitle>Order Details</CardTitle>
                <p className="font-mono text-xs text-muted-foreground mt-1">{selectedOrder.orderId}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-black">${(selectedOrder.total_amount || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Order Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 font-semibold">Customer ID</p>
                  <p className="font-medium">{selectedOrder.userId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 font-semibold">Order Date</p>
                  <p className="font-medium">{selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'PPP pp') : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1 font-semibold">Shipping Address</p>
                  {selectedOrder.shipping_address ? (
                    <div className="bg-muted/20 p-3 rounded-md border">
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                    </div>
                  ) : (
                    <p className="italic text-muted-foreground">No address provided</p>
                  )}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-3 border-b pb-2">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-muted/10 p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs font-mono">
                          {item.productId?.substring(0, 4)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">Product ID: {item.productId}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
            <div className="flex justify-end p-4 bg-muted/10 border-t mt-2 rounded-b-xl sticky bottom-0 z-10 backdrop-blur-md">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
