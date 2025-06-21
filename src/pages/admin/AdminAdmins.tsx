
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdmin } from "@/contexts/AdminContext";
import InviteAdminForm from "@/components/admin/InviteAdminForm";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { useAdmins } from "@/hooks/useAdmins";

const AdminAdmins = () => {
  const { adminRole } = useAdmin();
  const { admins, loading, fetchAdmins, handleActivationToggle, handleRoleChange, handleRemoveAdmin } = useAdmins();
  
  const isSuperAdmin = adminRole === "super_admin";

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <p className="text-gray-600">
            {isSuperAdmin
              ? "Invite new admins, manage roles, and toggle admin statuses."
              : "Only super admins can add/remove admins. You can view all admins below."}
          </p>
        </div>
        
        <InviteAdminForm onInviteSuccess={fetchAdmins} isSuperAdmin={isSuperAdmin} />
        
        <AdminUsersTable
          admins={admins}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
          onActivationToggle={handleActivationToggle}
          onRoleChange={handleRoleChange}
          onRemoveAdmin={handleRemoveAdmin}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAdmins;
