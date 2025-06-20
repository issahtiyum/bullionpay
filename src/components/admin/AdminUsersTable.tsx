
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableRow, TableCell, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AdminUser = {
  id: string;
  email: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

interface AdminUsersTableProps {
  admins: AdminUser[];
  loading: boolean;
  isSuperAdmin: boolean;
  onActivationToggle: (admin: AdminUser) => void;
}

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  admins,
  loading,
  isSuperAdmin,
  onActivationToggle,
}) => {
  // Count active super admins
  const activeSuperAdminsCount = admins.filter(admin => 
    admin.role === 'super_admin' && admin.is_active
  ).length;

  const isLastActiveSuperAdmin = (admin: AdminUser) => {
    return admin.role === 'super_admin' && admin.is_active && activeSuperAdminsCount === 1;
  };

  return (
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
              admins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge>{admin.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.is_active ? "default" : "secondary"}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : ""}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onActivationToggle(admin)}
                        disabled={
                          admin.email === "superadmin@bullionpay.com" || 
                          isLastActiveSuperAdmin(admin)
                        }
                        title={
                          isLastActiveSuperAdmin(admin) 
                            ? "Cannot deactivate the last active super admin" 
                            : undefined
                        }
                      >
                        {admin.is_active ? "Deactivate" : "Activate"}
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
  );
};

export default AdminUsersTable;
