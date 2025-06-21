
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrdersSearch from '@/components/admin/OrdersSearch';
import OrdersTable from '@/components/admin/OrdersTable';
import OrderEditModal from '@/components/admin/OrderEditModal';
import { useOrders, Order } from '@/hooks/useOrders';

const AdminOrders = () => {
  const { orders, loading, updateOrder, toggleAttendedStatus } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order =>
    order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleCloseEdit = () => {
    setEditingOrder(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
        </div>

        <OrdersSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />

        <OrdersTable 
          orders={filteredOrders}
          onEditOrder={handleEditOrder}
          onToggleAttended={toggleAttendedStatus}
        />

        <OrderEditModal
          order={editingOrder}
          onClose={handleCloseEdit}
          onSave={updateOrder}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
