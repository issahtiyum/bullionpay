
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersTable from "@/components/admin/OrdersTable";
import OrdersSearch from "@/components/admin/OrdersSearch";
import OrdersFilter from "@/components/admin/OrdersFilter";
import { useOrders } from "@/hooks/useOrders";

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'test' | 'live'>('all');
  const { data: orders, isLoading, error } = useOrders();

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnvironment = environmentFilter === 'all' || 
      (environmentFilter === 'test' && order.is_test) ||
      (environmentFilter === 'live' && !order.is_test);
    
    return matchesSearch && matchesEnvironment;
  }) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all customer orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <OrdersSearch 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />
          <OrdersFilter 
            filter={environmentFilter}
            onFilterChange={setEnvironmentFilter}
          />
        </div>
        
        <OrdersTable 
          orders={filteredOrders} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
