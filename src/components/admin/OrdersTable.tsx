
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle, Circle, Eye } from 'lucide-react';
import { Order } from '@/hooks/useOrders';
import CustomFieldDataDisplay from './CustomFieldDataDisplay';

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
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custom Fields</TableHead>
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
                    <CustomFieldDataDisplay customFieldData={order.custom_field_data} />
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
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{order.product_name}</h3>
                  <p className="text-lg font-semibold text-bullion-purple">
                    GH₵{Number(order.amount).toFixed(2)}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2">
                  {order.status}
                </Badge>
              </div>
              
              {/* Custom Fields for Mobile */}
              {order.custom_field_data && Object.keys(order.custom_field_data).length > 0 && (
                <div className="mb-3">
                  <CustomFieldDataDisplay customFieldData={order.custom_field_data} />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
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
                
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditOrder(order)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
