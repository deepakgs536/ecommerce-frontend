import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderAPI } from '@/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Package, MapPin, Truck, CheckCircle2, CreditCard, Clock, Check } from 'lucide-react';

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'edit' | 'payments'>('overview');
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    street: '', city: '', state: '', zip: '',
    contact_number: '', delivery_instructions: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const response = await OrderAPI.getById(id);
          const orderData = response.data.data;
          setOrder(orderData);
          if (orderData.shipping_address) {
            setEditForm({
              street: orderData.shipping_address.street || '',
              city: orderData.shipping_address.city || '',
              state: orderData.shipping_address.state || '',
              zip: orderData.shipping_address.zip || '',
              contact_number: orderData.contact_number || '',
              delivery_instructions: orderData.delivery_instructions || ''
            });
          }
        }
      } catch (error) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    
    setIsUpdating(true);
    try {
      const response = await OrderAPI.updateOrder(order.orderId, {
        shipping_address: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          zip: editForm.zip
        },
        contact_number: editForm.contact_number,
        delivery_instructions: editForm.delivery_instructions
      });
      setOrder(response.data.data);
      toast.success('Order details updated successfully!');
      setActiveTab('overview');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20">Order not found</div>;
  }

  const stages = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
  const currentStageIndex = stages.indexOf(order.status);
  
  // Handling CANCELLED status specially
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Link to="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order #{order.orderId}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Placed on {order.created_at ? format(new Date(order.created_at), 'MMMM dd, yyyy - hh:mm a') : 'Unknown'}
          </p>
        </div>
        <Badge variant={isCancelled ? 'destructive' : (order.status === 'DELIVERED' ? 'default' : 'secondary')} className="text-lg py-1.5 px-6 font-semibold shadow-sm">
          {order.status}
        </Badge>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b mb-8 pb-px no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Package },
          { id: 'tracking', label: 'Tracking', icon: Truck },
          { id: 'edit', label: 'Edit Details', icon: MapPin },
          { id: 'payments', label: 'Payments', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="premium-shadow overflow-hidden border-border/50">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center text-lg">
                    <Package className="mr-2 h-5 w-5 text-primary" /> Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-6 border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center border shadow-sm">
                           <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{item.productId}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                            <span className="text-sm text-muted-foreground">${item.price_at_addition?.toFixed(2)} each</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-lg">${((item.price_at_addition || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="premium-shadow border-border/50">
                <CardHeader className="bg-muted/30">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${order.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${order.total_amount?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-shadow border-border/50">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="mr-2 h-5 w-5 text-primary" /> Shipping Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pt-6">
                  {order.shipping_address ? (
                    <div className="space-y-1">
                      <p className="font-medium">{order.shipping_address.street}</p>
                      <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No address provided.</p>
                  )}
                  {order.contact_number && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Contact</span>
                      <p>{order.contact_number}</p>
                    </div>
                  )}
                  {order.delivery_instructions && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Instructions</span>
                      <p className="italic text-muted-foreground">"{order.delivery_instructions}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TRACKING TAB */}
        {activeTab === 'tracking' && (
          <Card className="premium-shadow max-w-3xl mx-auto border-border/50">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-xl">Order Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              {isCancelled ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
                     <span className="text-3xl">❌</span>
                  </div>
                  <h2 className="text-2xl font-bold text-destructive mb-2">Order Cancelled</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">This order has been cancelled and cannot be fulfilled. If you have been charged, a refund will be issued shortly.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-0 md:left-1/2 top-4 bottom-4 w-px bg-border md:w-full md:h-px md:top-1/2 md:-left-4 md:right-4 z-0">
                     {/* Colored Progress Line */}
                     <div 
                        className="bg-primary absolute left-0 top-0 transition-all duration-1000 ease-in-out"
                        style={{ 
                          width: window.innerWidth >= 768 ? `${Math.max(0, currentStageIndex) * 33.33}%` : '2px',
                          height: window.innerWidth < 768 ? `${Math.max(0, currentStageIndex) * 33.33}%` : '2px'
                        }}
                     />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                    {stages.map((stage, idx) => {
                      const isCompleted = currentStageIndex >= idx;
                      const isCurrent = currentStageIndex === idx;
                      return (
                        <div key={stage} className="flex md:flex-col items-center gap-4 md:gap-3 group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm
                            ${isCompleted ? 'bg-primary border-primary text-primary-foreground scale-110' : 'bg-background border-muted text-muted-foreground'}
                            ${isCurrent ? 'ring-4 ring-primary/20 shadow-primary/30' : ''}
                          `}>
                            {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold">{idx + 1}</span>}
                          </div>
                          <div className="md:text-center">
                            <p className={`font-bold tracking-tight ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{stage}</p>
                            {isCurrent && <p className="text-xs text-primary font-medium mt-1 animate-pulse">Current Status</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* EDIT DETAILS TAB */}
        {activeTab === 'edit' && (
          <Card className="premium-shadow max-w-2xl mx-auto border-border/50">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Update Order Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Updates Disabled</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    This order is currently <strong>{order.status}</strong>. Shipping and contact details can only be modified while the order is in PENDING state.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Street Address</label>
                      <Input 
                        placeholder="123 Main St" 
                        value={editForm.street}
                        onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input 
                        placeholder="City" 
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State / Province</label>
                      <Input 
                        placeholder="State" 
                        value={editForm.state}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Zip / Postal Code</label>
                      <Input 
                        placeholder="Zip" 
                        value={editForm.zip}
                        onChange={(e) => setEditForm({...editForm, zip: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Number</label>
                      <Input 
                        placeholder="+1 (555) 000-0000" 
                        value={editForm.contact_number}
                        onChange={(e) => setEditForm({...editForm, contact_number: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Delivery Instructions (Optional)</label>
                      <Input 
                        placeholder="e.g., Leave at front door" 
                        value={editForm.delivery_instructions}
                        onChange={(e) => setEditForm({...editForm, delivery_instructions: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={isUpdating}>
                    {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <Card className="premium-shadow max-w-2xl mx-auto border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" /> Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-6 md:p-8 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl border bg-card shadow-sm">
                   <div className="space-y-1">
                     <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Amount Due</p>
                     <p className="text-4xl font-bold tracking-tight text-primary">${order.total_amount?.toFixed(2)}</p>
                   </div>
                   <div className="text-left md:text-right">
                     <Badge variant={['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'default' : (isCancelled ? 'destructive' : 'secondary')} className="text-base py-1 px-4 mb-2 shadow-sm">
                       {['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'Payment Successful' : (isCancelled ? 'Cancelled' : 'Awaiting Payment')}
                     </Badge>
                     <p className="text-sm text-muted-foreground font-medium">Order Ref: {order.orderId.substring(0,8).toUpperCase()}</p>
                   </div>
                 </div>

                 {['PENDING'].includes(order.status) && (
                   <div className="bg-secondary/20 p-8 rounded-xl border border-secondary text-center animate-in fade-in zoom-in-95">
                     <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                       <CreditCard className="h-8 w-8" />
                     </div>
                     <h4 className="font-semibold text-xl mb-2 tracking-tight">Complete your order</h4>
                     <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Your order is currently pending. Click below to simulate a payment and initiate shipping.</p>
                     <Button 
                       size="lg" 
                       className="px-10 h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                       disabled={isUpdating}
                       onClick={async () => {
                         setIsUpdating(true);
                         try {
                           await OrderAPI.updateOrderStatus(order.orderId, 'PAID');
                           setOrder({ ...order, status: 'PAID' });
                           toast.success('Payment completed successfully!');
                         } catch (error) {
                           toast.error('Payment failed');
                         } finally {
                           setIsUpdating(false);
                         }
                       }}
                     >
                       {isUpdating ? 'Processing...' : 'Complete Payment'}
                     </Button>
                   </div>
                 )}
                 
                 {['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                   <div className="flex items-start gap-4 text-sm bg-green-500/10 text-green-700 dark:text-green-400 p-6 rounded-xl border border-green-500/20">
                     <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                     <div>
                       <p className="font-semibold text-base mb-1">Payment was processed successfully</p>
                       <p className="opacity-90 leading-relaxed">Thank you for your purchase! We've received your payment and your order is now being processed. A detailed receipt has been sent to your email.</p>
                     </div>
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};
