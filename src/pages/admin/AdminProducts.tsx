
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProductForm from '@/components/admin/ProductForm';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useAdmin } from '@/contexts/AdminContext';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

const AdminProducts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  const { adminRole } = useAdmin();
  const { data: products, isLoading } = useProducts(true); // Include inactive products for admin
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  // Check permissions based on role
  const canManageProducts = adminRole === 'admin' || adminRole === 'super_admin';
  const canDelete = adminRole === 'super_admin';

  // If user doesn't have permission to manage products, show access denied
  if (!canManageProducts) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage products.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateProduct = async (productData: any) => {
    await createProduct.mutateAsync(productData);
    setShowForm(false);
  };

  const handleUpdateProduct = async (productData: any) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        updates: productData,
      });
      setEditingProduct(null);
      setShowForm(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteProductId) {
      await deleteProduct.mutateAsync(deleteProductId);
      setDeleteProductId(null);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    await updateProduct.mutateAsync({
      id: product.id,
      updates: { is_active: !product.is_active },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading products...</div>
      </AdminLayout>
    );
  }

  if (showForm) {
    return (
      <AdminLayout>
        <div className="p-6">
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            isSubmitting={createProduct.isPending || updateProduct.isPending}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3 lg:gap-4">
          <h1 className="text-lg sm:text-2xl font-semibold">
            <span className="hidden sm:inline">Product Management</span>
            <span className="sm:hidden">Products</span>
          </h1>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto text-xs sm:text-sm py-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="text-base sm:text-xl">Products ({products?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.image || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>GHS {product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleProductStatus(product)}
                            disabled={updateProduct.isPending}
                          >
                            {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteProductId(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile List - Visible only on mobile */}
            <div className="lg:hidden space-y-4">
              {products?.map((product, index) => (
                <div key={product.id}>
                  <div className="py-4">
                    <div className="flex gap-3 mb-3">
                      <img 
                        src={product.image || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                            {product.is_active ? "Active" : "Hidden"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-base font-semibold text-bullion-purple">
                          GHS {product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleProductStatus(product)}
                        disabled={updateProduct.isPending}
                        className="flex-1 text-xs py-2"
                      >
                        {product.is_active ? (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Show
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="flex-1 text-xs py-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteProductId(product.id)}
                          className="px-3 py-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {index < (products?.length || 0) - 1 && (
                    <Separator className="bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
            
            {!products?.length && (
              <div className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                <span className="hidden sm:inline">No products found. Add your first product to get started.</span>
                <span className="sm:hidden">No products found.</span>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
