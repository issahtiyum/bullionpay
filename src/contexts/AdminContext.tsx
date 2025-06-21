
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type AdminRole = 'super_admin' | 'admin' | 'moderator';

type AdminUser = {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

type AdminContextType = {
  isAdmin: boolean;
  adminRole: AdminRole | null;
  adminUser: AdminUser | null;
  loading: boolean;
  checkAdminStatus: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminRole: null,
  adminUser: null,
  loading: true,
  checkAdminStatus: async () => {},
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const checkAdminStatus = useCallback(async () => {
    // Don't check admin status if auth is still loading or user isn't authenticated
    if (authLoading || !isAuthenticated || !user) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (adminData) {
        setIsAdmin(true);
        setAdminRole(adminData.role as AdminRole);
        setAdminUser(adminData as AdminUser);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminUser(null);
      }
    } catch (error) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminRole,
      adminUser,
      loading,
      checkAdminStatus,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
