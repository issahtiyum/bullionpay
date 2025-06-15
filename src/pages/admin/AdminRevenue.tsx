
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const AdminRevenue = () => {
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      // Get all paid orders and group them by day
      const { data, error } = await supabase
        .from("orders")
        .select("amount, created_at")
        .eq("status", "paid");

      if (error) throw error;

      // Aggregate by date (YYYY-MM-DD)
      const revenueMap: Record<string, number> = {};
      let total = 0;
      data?.forEach((order: any) => {
        const day = new Date(order.created_at).toISOString().slice(0, 10);
        revenueMap[day] = (revenueMap[day] || 0) + Number(order.amount);
        total += Number(order.amount);
      });

      // Sort by date ascending
      const chartData = Object.keys(revenueMap)
        .sort()
        .map((date) => ({
          date,
          amount: revenueMap[date],
        }));

      setRevenueData(chartData);
      setTotalRevenue(total);
    } catch (err) {
      setRevenueData([]);
      setTotalRevenue(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Revenue Overview</h1>
          <p className="text-gray-600">See revenue trends and stats from all paid orders.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">GH₵{totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Paid Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{revenueData.reduce((acc, row) => acc + row.amount, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{revenueData.length ? revenueData[revenueData.length - 1].date : "N/A"}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Chart (by Date)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8847f8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
