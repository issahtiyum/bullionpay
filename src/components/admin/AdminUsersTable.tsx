
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableRow, TableCell, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, UserCog } from "lucide-react";

type AdminRole = "super_admin" | "admin" | "moderator";

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
  onRoleChange: (adminId: string, newRole: AdminRole) => void;
  onRemoveAdmin: (adminId: string) => void;
}

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  admins,
  loading,
  isSuperAdmin,
  onActivationToggle,
  onRoleChange,
  onRemoveAdmin,
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'remove' | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminRole | "">("");

  // Count active super admins
  const activeSuperAdminsCount = admins.filter(admin => 
    admin.role === 'super_admin' && admin.is_active
  ).length;

  const isLastActiveSuperAdmin = (admin: AdminUser) => {
    return admin.role === 'super_admin' && admin.is_active && activeSuperAdminsCount === 1;
  };

  const isMainSuperAdmin = (admin: AdminUser) => {
    return admin.email === "myharis.issah@gmail.com";
  };

  const handleConfirmAction = () => {
    if (selectedAdmin && actionType) {
      if (actionType === 'activate') {
        onActivationToggle(selectedAdmin);
      } else if (actionType === 'remove') {
        onRemoveAdmin(selectedAdmin.id);
      }
      setSelectedAdmin(null);
      setActionType(null);
    }
  };

  const handleRoleChangeConfirm = () => {
    if (selectedAdmin && selectedRole && selectedRole !== "") {
      onRoleChange(selectedAdmin.id, selectedRole as AdminRole);
      setSelectedAdmin(null);
      setSelectedRole("");
    }
  };

  const openActionDialog = (admin: AdminUser, action: 'activate' | 'remove') => {
    setSelectedAdmin(admin);
    setActionType(action);
  };

  const openRoleDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setSelectedRole(admin.role as AdminRole);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Admins</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
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
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              isMainSuperAdmin(admin) || 
                              isLastActiveSuperAdmin(admin)
                            }
                            onClick={() => openActionDialog(admin, 'activate')}
                          >
                            {admin.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={isMainSuperAdmin(admin)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openRoleDialog(admin)}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openActionDialog(admin, 'remove')}
                                className="text-red-600"
                                disabled={isLastActiveSuperAdmin(admin)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
        </div>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading admins...</div>
          ) : admins.length ? (
            admins.map(admin => (
              <div key={admin.id} className="border rounded-lg p-4 bg-white">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-lg truncate">{admin.email}</p>
                    <p className="text-sm text-gray-500">
                      Added: {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge>{admin.role}</Badge>
                    <Badge variant={admin.is_active ? "default" : "secondary"}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  {isSuperAdmin && (
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          isMainSuperAdmin(admin) || 
                          isLastActiveSuperAdmin(admin)
                        }
                        onClick={() => openActionDialog(admin, 'activate')}
                        className="w-full"
                      >
                        {admin.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRoleDialog(admin)}
                          disabled={isMainSuperAdmin(admin)}
                          className="flex-1"
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(admin, 'remove')}
                          disabled={isMainSuperAdmin(admin) || isLastActiveSuperAdmin(admin)}
                          className="flex-1 text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">No admins found.</div>
          )}
        </div>
      </CardContent>

      {/* Activation/Deactivation Dialog */}
      <AlertDialog open={!!selectedAdmin && actionType === 'activate'} onOpenChange={() => {
        setSelectedAdmin(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAdmin?.is_active ? "Deactivate" : "Activate"} Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedAdmin?.is_active ? "deactivate" : "activate"} {selectedAdmin?.email}?
              {selectedAdmin?.is_active 
                ? " This will remove their admin access immediately." 
                : " This will restore their admin access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedAdmin(null);
              setActionType(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {selectedAdmin?.is_active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Admin Dialog */}
      <AlertDialog open={!!selectedAdmin && actionType === 'remove'} onOpenChange={() => {
        setSelectedAdmin(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedAdmin?.email} as an admin? 
              This action cannot be undone and they will lose all admin privileges immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedAdmin(null);
              setActionType(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={!!selectedAdmin && !actionType} onOpenChange={() => {
        setSelectedAdmin(null);
        setSelectedRole("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Admin Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role for {selectedAdmin?.email}. This will affect their permissions immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={(value: AdminRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedAdmin(null);
              setSelectedRole("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChangeConfirm}>
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminUsersTable;
