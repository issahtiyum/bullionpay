
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle, Circle } from 'lucide-react';
import { Order } from '@/hooks/useOrders';

interface OrdersTableProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
  onToggleAttended: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onEditOrder, onToggleAttended }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'delivered': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Mobile view - Card layout */}
        <div className="block sm:hidden">
          {orders.map((order) => (
            <div key={order.id} className="border-b p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.product_name}</p>
                  <p className="text-sm text-gray-600">GH₵{Number(order.amount).toFixed(2)}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2">
                  {order.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleAttended(order)}
                    className="p-1"
                  >
                    {order.attended ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {order.attended ? 'Attended' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditOrder(order)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No orders found.
            </div>
          )}
        </div>

        {/* Desktop view - Table layout */}
        <div className="hidden sm:block">
          <Table className="mobile-table-responsive">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.product_name}</TableCell>
                  <TableCell>GH₵{Number(order.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleAttended(order)}
                        className="p-1"
                      >
                        {order.attended ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {order.attended ? 'Attended' : 'Pending'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditOrder(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
