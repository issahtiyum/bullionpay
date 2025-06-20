
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    fetchAdmins,
    handleActivationToggle,
  };
};
