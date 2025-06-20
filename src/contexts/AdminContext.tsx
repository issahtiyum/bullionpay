
import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuth();

  const checkAdminStatus = async () => {
    if (!user || !isAuthenticated) {
      setIsAdmin(false);
      setAdminRole(null);
      setAdminUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Checking admin status for user:', user.id);
      
      // Try to directly query admin_users table first (fallback approach)
      const { data: adminData, error: directError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!directError && adminData) {
        console.log('Direct query successful:', adminData);
        setIsAdmin(true);
        setAdminRole(adminData.role as AdminRole);
        setAdminUser(adminData as AdminUser);
        setLoading(false);
        return;
      }

      // If direct query fails, try RPC functions
      console.log('Direct query failed, trying RPC functions...');
      
      // Check if user is admin using security definer function
      const { data: isAdminResult, error: isAdminError } = await supabase.rpc('check_is_admin', {
        user_id: user.id,
      });

      if (isAdminError) {
        console.error('RPC check_is_admin error:', isAdminError);
        // If RPC fails due to CORS or other issues, fallback to direct table query
        console.log('RPC failed, using direct table query results');
        setIsAdmin(false);
        setAdminRole(null);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      setIsAdmin(!!isAdminResult);

      if (isAdminResult) {
        // Get admin role from rpc
        const { data: adminRoleData, error: adminRoleError } = await supabase.rpc('get_admin_role', {
          user_id: user.id,
        });

        if (!adminRoleError && adminRoleData) {
          setAdminRole(adminRoleData as AdminRole);
          setAdminUser(adminData as AdminUser);
        } else {
          console.error('Error getting admin role:', adminRoleError);
          // Fallback: use the direct query result if we have it
          if (adminData) {
            setAdminRole(adminData.role as AdminRole);
            setAdminUser(adminData as AdminUser);
          } else {
            setAdminRole(null);
            setAdminUser(null);
          }
        }
      } else {
        setAdminRole(null);
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminRole(null);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

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
