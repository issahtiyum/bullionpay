
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const roles = ["admin", "moderator", "super_admin"];

interface InviteAdminFormProps {
  onInviteSuccess: () => void;
  isSuperAdmin: boolean;
}

const InviteAdminForm: React.FC<InviteAdminFormProps> = ({ onInviteSuccess, isSuperAdmin }) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "moderator" | "super_admin">("admin");
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!isSuperAdmin || !inviteEmail) return;

    const trimmedEmail = inviteEmail.trim().toLowerCase();
    setInviting(true);

    try {
      // Look up user profile by email
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', trimmedEmail)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast({
            title: "User Not Found",
            description: `No user found with email "${trimmedEmail}". The user must sign up first before being invited as an admin.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Error looking up user: ${profileError.message}`,
            variant: "destructive",
          });
        }
        return;
      }

      if (!existingProfile) {
        toast({
          title: "User Not Found",
          description: `No user found with email "${trimmedEmail}". The user must sign up first before being invited as an admin.`,
          variant: "destructive",
        });
        return;
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('id, is_active, role')
        .eq('user_id', existingProfile.id)
        .single();

      if (adminCheckError && adminCheckError.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: `Error checking admin status: ${adminCheckError.message}`,
          variant: "destructive",
        });
        return;
      }

      if (existingAdmin) {
        if (existingAdmin.is_active) {
          toast({
            title: "Already an Admin",
            description: `This user is already an active ${existingAdmin.role}.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Admin Exists",
            description: `This user is already an admin (${existingAdmin.role}) but inactive. Please activate them instead.`,
            variant: "destructive",
          });
        }
        return;
      }

      // Create new admin user
      const adminData = {
        user_id: existingProfile.id,
        email: trimmedEmail,
        role: inviteRole,
        is_active: true,
      };

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert(adminData);

      if (insertError) {
        toast({
          title: "Error",
          description: `Failed to create admin user: ${insertError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin Invited Successfully",
        description: `${trimmedEmail} has been added as ${inviteRole}.`,
      });

      setInviteEmail("");
      setInviteRole("admin");
      onInviteSuccess();

    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  if (!isSuperAdmin) return null;

  return (
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
            className="flex-1"
          />
          <select
            disabled={inviting}
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as "admin" | "moderator" | "super_admin")}
            className="border px-3 py-2 rounded min-w-[120px]"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button 
            disabled={inviting || !inviteEmail.trim()} 
            onClick={handleInvite}
            className="min-w-[140px]"
          >
            {inviting ? "Adding..." : "Invite as Admin"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only existing site users can receive admin roles. The user must have an account first.
        </p>
      </CardContent>
    </Card>
  );
};

export default InviteAdminForm;
