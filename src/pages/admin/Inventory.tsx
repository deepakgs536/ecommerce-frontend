import { useEffect, useState } from 'react';
import { ProductAPI, InventoryAPI } from '@/api/services';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RefreshCcw, AlertCircle, Edit, TrendingDown, Package, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export const AdminInventory = () => {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ available_quantity: 0, reserved_quantity: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        ProductAPI.getAll(),
        InventoryAPI.getAll()
      ]);

      const products = productsRes.data.data;
      const invData = inventoryRes.data.data;

      const merged = products.map((product: any) => {
        const inv = invData.find((i: any) => i.productId === product.productId) || {
          available_quantity: 0,
          reserved_quantity: 0,
          updated_at: new Date().toISOString()
        };
        return { ...product, ...inv };
      });

      setInventoryItems(merged);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setEditForm({
      available_quantity: item.available_quantity,
      reserved_quantity: item.reserved_quantity
    });
  };

  const handleEditConfirm = async () => {
    if (!editingItem) return;
    setActionLoading(true);
    try {
      await InventoryAPI.update(editingItem.productId, editForm);
      setInventoryItems(inventoryItems.map(item => 
        item.productId === editingItem.productId 
          ? { ...item, ...editForm, updated_at: new Date().toISOString() } 
          : item
      ));
      toast.success('Inventory updated successfully');
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to update inventory');
    } finally {
      setActionLoading(false);
    }
  };

  const outOfStockCount = inventoryItems.filter(p => p.available_quantity === 0).length;
  const totalAvailable = inventoryItems.reduce((acc, curr) => acc + (curr.available_quantity || 0), 0);
  const totalReserved = inventoryItems.reduce((acc, curr) => acc + (curr.reserved_quantity || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Inventory Central
          </h1>
          <p className="text-muted-foreground mt-1.5 text-lg">Real-time stock levels and warehouse distribution.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchInventory} 
          disabled={loading}
          className="shadow-sm hover:shadow transition-all bg-background/50 backdrop-blur-sm"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-shadow border-0 bg-gradient-to-br from-blue-500/10 via-background to-background overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              Total Available
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black">{loading ? '-' : totalAvailable}</div>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Ready to ship units</p>
          </CardContent>
        </Card>

        <Card className="premium-shadow border-0 bg-gradient-to-br from-amber-500/10 via-background to-background overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              Reserved Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-amber-700 dark:text-amber-500">{loading ? '-' : totalReserved}</div>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Allocated for pending orders</p>
          </CardContent>
        </Card>

        <Card className={`premium-shadow border-0 overflow-hidden relative ${outOfStockCount > 0 ? 'bg-gradient-to-br from-destructive/15 via-destructive/5 to-background' : 'bg-gradient-to-br from-muted/30 to-background'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown className="w-16 h-16" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className={`text-sm font-semibold tracking-wider uppercase flex items-center gap-2 ${outOfStockCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {outOfStockCount > 0 && <AlertCircle className="h-4 w-4" />}
              Stock Depleted
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-4xl font-black ${outOfStockCount > 0 ? 'text-destructive' : ''}`}>
              {loading ? '-' : outOfStockCount}
            </div>
            <p className={`text-sm mt-1 font-medium ${outOfStockCount > 0 ? 'text-destructive/80' : 'text-muted-foreground'}`}>
              Products requiring restock
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-shadow border-0 bg-background/60 backdrop-blur-xl">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle>Stock Overview</CardTitle>
          <CardDescription>Manage individual product quantities and allocations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-transparent hover:bg-transparent">
                  <TableRow>
                    <TableHead className="py-4 px-6">Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map(item => {
                    const total = item.available_quantity + item.reserved_quantity;
                    const stockPercentage = total > 0 ? Math.min(100, Math.round((item.available_quantity / total) * 100)) : 0;
                    const isLowStock = item.available_quantity > 0 && item.available_quantity <= 10;
                    const isOutOfStock = item.available_quantity === 0;
                    
                    return (
                      <TableRow key={item.productId} className={`hover:bg-muted/30 transition-colors ${isOutOfStock ? 'bg-destructive/5 hover:bg-destructive/10' : ''}`}>
                        <TableCell className="font-medium py-3 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img src={item.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500&q=80'} alt={item.name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                              {isOutOfStock && <div className="absolute inset-0 bg-background/50 rounded-lg backdrop-blur-[1px]"></div>}
                            </div>
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{item.sku || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`font-bold text-base ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-amber-500' : ''}`}>
                              {item.available_quantity}
                            </span>
                            {/* Visual Stock Indicator */}
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isOutOfStock ? 'bg-destructive' : isLowStock ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.max(5, stockPercentage)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-background/50">{item.reserved_quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}
                            className={`
                              ${isLowStock ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                            `}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {item.updated_at ? format(new Date(item.updated_at), 'MMM dd, HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="hover:bg-primary/10 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Inventory Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-2xl border-0 ring-1 ring-border/50">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle>Update Inventory</CardTitle>
              <CardDescription className="line-clamp-1">{editingItem.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex justify-between">
                  <span>Available Quantity</span>
                  <span className="text-muted-foreground font-normal">Ready to ship</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  value={editForm.available_quantity}
                  onChange={e => setEditForm({...editForm, available_quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex justify-between">
                  <span>Reserved Quantity</span>
                  <span className="text-muted-foreground font-normal">Pending orders</span>
                </label>
                <input 
                  type="number"
                  min="0"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  value={editForm.reserved_quantity}
                  onChange={e => setEditForm({...editForm, reserved_quantity: parseInt(e.target.value) || 0})}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-2 bg-muted/10 border-t mt-2 rounded-b-xl">
              <Button variant="ghost" onClick={() => setEditingItem(null)} disabled={actionLoading}>Cancel</Button>
              <Button onClick={handleEditConfirm} disabled={actionLoading} className="shadow-md">
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
