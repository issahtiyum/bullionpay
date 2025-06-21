
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type Dispute = {
  id: string;
  user_id: string;
  order_id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  resolved_by: string | null;
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "", admin_notes: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDisputes(data as Dispute[]);
    }
    setLoading(false);
  };

  const handleEdit = (id: string, dispute: Dispute) => {
    setEditId(id);
    setEditForm({
      status: dispute.status,
      admin_notes: dispute.admin_notes || "",
    });
  };

  const handleUpdateDispute = async () => {
    if (!editId) return;
    const { error } = await supabase
      .from("disputes")
      .update({
        status: editForm.status,
        admin_notes: editForm.admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editId);

    if (!error) {
      toast({ title: "Updated", description: "Dispute updated successfully." });
      setEditId(null);
      fetchDisputes();
    } else {
      toast({ title: "Error", description: "Failed to update dispute.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Disputes</h1>
          <p className="text-gray-600">View and manage all customer disputes submitted for orders.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Disputes ({disputes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Admin Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="py-8 text-center text-gray-500">Loading disputes...</div>
                      </TableCell>
                    </TableRow>
                  ) : disputes.length ? (
                    disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">{dispute.reason}</TableCell>
                        <TableCell>
                          <Badge variant={
                            dispute.status === "pending"
                              ? "secondary"
                              : dispute.status === "resolved"
                                ? "default"
                                : "outline"
                          }>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {dispute.description || <span className="text-gray-400">No description</span>}
                        </TableCell>
                        <TableCell>
                          {editId === dispute.id ? (
                            <Input
                              value={editForm.admin_notes}
                              onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                              placeholder="Edit admin notes"
                            />
                          ) : (
                            dispute.admin_notes || <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {editId === dispute.id ? (
                            <div className="flex gap-2">
                              <select
                                value={editForm.status}
                                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                              <Button size="sm" onClick={handleUpdateDispute}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleEdit(dispute.id, dispute)}>
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="py-8 text-center text-gray-500">No disputes found.</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards - Visible only on mobile */}
            <div className="lg:hidden space-y-4">
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading disputes...</div>
              ) : disputes.length ? (
                disputes.map((dispute) => (
                  <div key={dispute.id} className="border rounded-lg p-4 bg-white">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg">{dispute.reason}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <Badge variant={
                          dispute.status === "pending"
                            ? "secondary"
                            : dispute.status === "resolved"
                              ? "default"
                              : "outline"
                        }>
                          {dispute.status}
                        </Badge>
                      </div>
                      
                      {dispute.description && (
                        <div>
                          <Label className="text-sm font-medium">Description:</Label>
                          <p className="text-sm text-gray-600 mt-1">{dispute.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm font-medium">Admin Notes:</Label>
                        {editId === dispute.id ? (
                          <Input
                            value={editForm.admin_notes}
                            onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                            placeholder="Edit admin notes"
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            {dispute.admin_notes || "No admin notes"}
                          </p>
                        )}
                      </div>
                      
                      {editId === dispute.id ? (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-medium">Status:</Label>
                            <select
                              value={editForm.status}
                              onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                              className="w-full border rounded px-3 py-2 mt-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateDispute} className="flex-1">
                              Save Changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(dispute.id, dispute)}
                          className="w-full"
                        >
                          Edit Dispute
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">No disputes found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDisputes;
