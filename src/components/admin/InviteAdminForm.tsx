
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

    setInviting(true);

    try {
      // First, check if a user with this email exists in profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', inviteEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!existingProfile) {
        toast({
          title: "User Not Found",
          description: "No user found with this email address. The user must sign up first before being invited as an admin.",
          variant: "destructive",
        });
        setInviting(false);
        return;
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', existingProfile.id)
        .single();

      if (adminCheckError && adminCheckError.code !== 'PGRST116') {
        throw adminCheckError;
      }

      if (existingAdmin) {
        if (existingAdmin.is_active) {
          toast({
            title: "Already an Admin",
            description: "This user is already an active admin.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Admin Exists",
            description: "This user is already an admin but inactive. Please activate them instead.",
            variant: "destructive",
          });
        }
        setInviting(false);
        return;
      }

      // Create new admin user
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: existingProfile.id,
          email: inviteEmail,
          role: inviteRole,
          is_active: true,
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Admin Invited Successfully",
        description: `${inviteEmail} has been added as ${inviteRole}.`,
      });

      setInviteEmail("");
      setInviteRole("admin");
      onInviteSuccess();

    } catch (error) {
      console.error('Error inviting admin:', error);
      toast({
        title: "Error",
        description: "Failed to invite admin. Please try again.",
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
          />
          <select
            disabled={inviting}
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as "admin" | "moderator" | "super_admin")}
            className="border px-3 py-2 rounded"
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button disabled={inviting || !inviteEmail} onClick={handleInvite}>
            {inviting ? "Inviting..." : "Invite as Admin"}
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
