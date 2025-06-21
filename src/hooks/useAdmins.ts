
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AdminRole = "super_admin" | "admin" | "moderator";

type AdminUser = {
  id: string;
  email: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

export const useAdmins = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setAdmins(data as AdminUser[]);
    setLoading(false);
  };

  const handleActivationToggle = async (admin: AdminUser) => {
    // Check if this is a super admin being deactivated
    if (admin.role === 'super_admin' && admin.is_active) {
      // Count active super admins
      const activeSuperAdmins = admins.filter(a => 
        a.role === 'super_admin' && a.is_active && a.id !== admin.id
      );
      
      if (activeSuperAdmins.length === 0) {
        toast({ 
          title: "Cannot deactivate", 
          description: "There must be at least one active super admin in the system.", 
          variant: "destructive" 
        });
        return;
      }
    }

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

  const handleRoleChange = async (adminId: string, newRole: AdminRole) => {
    const { error } = await supabase.rpc('update_admin_role', {
      target_admin_id: adminId,
      new_role: newRole
    });

    if (!error) {
      toast({ title: "Success", description: "Admin role updated successfully." });
      fetchAdmins();
    } else {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update role", 
        variant: "destructive" 
      });
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    const { error } = await supabase.rpc('remove_admin_user', {
      target_admin_id: adminId
    });

    if (!error) {
      toast({ title: "Success", description: "Admin removed successfully." });
      fetchAdmins();
    } else {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove admin", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    fetchAdmins,
    handleActivationToggle,
    handleRoleChange,
    handleRemoveAdmin,
  };
};
