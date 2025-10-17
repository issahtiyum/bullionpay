
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Check, Circle } from "lucide-react";
import OrderEditModal from "./OrderEditModal";
import CustomFieldDataDisplay from "./CustomFieldDataDisplay";
import { Order } from "@/hooks/useOrders";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: any;
  toggleAttendedStatus: (order: Order) => Promise<boolean>;
}

const OrdersTable = ({ orders, isLoading, error, toggleAttendedStatus }: OrdersTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return <div className="text-center p-4">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error loading orders: {error.message}</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center p-4">No orders found.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Environment</TableHead>
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
                <TableCell>{order.product_name || 'N/A'}</TableCell>
                <TableCell>₵{order.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={order.is_test ? "secondary" : "default"}
                    className={order.is_test ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                  >
                    {order.is_test ? 'Test' : 'Live'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.status === 'pending' ? (
                    <span className="text-muted-foreground italic">Not available - Unpaid</span>
                  ) : order.custom_field_data ? (
                    <CustomFieldDataDisplay customFieldData={order.custom_field_data} />
                  ) : (
                    <span className="text-muted-foreground">No custom data</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleAttendedStatus(order)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    {order.attended ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Attended</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">Pending</span>
                      </>
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  {format(new Date(order.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      disabled={order.status === 'pending'}
                      title={order.status === 'pending' ? 'Cannot view unpaid orders' : 'View order'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      disabled={order.status === 'pending'}
                      title={order.status === 'pending' ? 'Cannot edit unpaid orders' : 'Edit order'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderEditModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={async () => true}
        />
      )}
    </>
  );
};

export default OrdersTable;
