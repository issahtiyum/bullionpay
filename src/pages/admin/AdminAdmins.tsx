
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableRow, TableCell, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const roles = ["admin", "moderator", "super_admin"];

type AdminUser = {
  id: string;
  email: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

const AdminAdmins = () => {
  const { adminRole } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  // fix: union type for allowed roles
  const [inviteRole, setInviteRole] = useState<"admin" | "moderator" | "super_admin">("admin");
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const isSuperAdmin = adminRole === "super_admin";

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAdmins(data as AdminUser[]);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!isSuperAdmin) return;

    setInviting(true);

    // 1. Check if user already an admin
    const { data: existing, error: existingError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", inviteEmail);

    if (existing && existing.length > 0) {
      toast({ title: "Already Admin", description: "This user is already an admin.", variant: "destructive" });
      setInviting(false);
      return;
    }

    // 2. Check if user exists (by email) in profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail)
      .maybeSingle();

    if (!profiles || !profiles.id) {
      toast({
        title: "User Not Found",
        description: "User with this email has not registered. Ask them to sign up before inviting.",
        variant: "destructive",
      });
      setInviting(false);
      return;
    }

    // 3. Insert new admin with user_id
    const { error } = await supabase
      .from("admin_users")
      .insert({
        email: inviteEmail,
        user_id: profiles.id,
        role: inviteRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      });

    if (!error) {
      toast({
        title: "Success",
        description: "Admin invited. User must sign in to access admin features.",
      });
      fetchAdmins();
      setInviteEmail("");
      setInviteRole("admin");
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setInviting(false);
  };

  const handleActivationToggle = async (admin: AdminUser) => {
    if (!isSuperAdmin) return;
    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: !admin.is_active, updated_at: new Date().toISOString() })
      .eq("id", admin.id);

    if (!error) {
      toast({ title: "Updated", description: "Admin status updated." });
      fetchAdmins();
    } else {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <p className="text-gray-600">
            {isSuperAdmin
              ? "Invite new admins and toggle admin statuses."
              : "Only super admins can add/remove admins. You can view all admins below."}
          </p>
        </div>
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Invite New Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  disabled={inviting}
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Admin email..."
                />
                <select
                  disabled={inviting}
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as "admin" | "moderator" | "super_admin")}
                  className="border px-3 py-2 rounded"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Button disabled={inviting || !inviteEmail} onClick={handleInvite}>Invite as Admin</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Only existing site users can receive admin roles. New admins should sign up with this email before using admin features.
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>All Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading admins...</TableCell>
                  </TableRow>
                ) : admins.length ? (
                  admins.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>
                        <Badge>{a.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.is_active ? "default" : "secondary"}>
                          {a.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivationToggle(a)}
                            disabled={a.email === "superadmin@bullionpay.com"}
                          >
                            {a.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No admins found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAdmins;
