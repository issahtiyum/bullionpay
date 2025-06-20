
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    if (!isSuperAdmin) return;

    setInviting(true);

    // Since we cannot look up by email in profiles, we fail gracefully
    toast({
      title: "Cannot Invite by Email",
      description:
        "User profiles do not contain emails. Please contact support, or invite using user IDs. (Ask your developer to add emails to the profiles table for this feature.)",
      variant: "destructive",
    });
    setInviting(false);
    return;
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
            Invite as Admin
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only existing site users can receive admin roles. <br />
          <b>NOTE:</b> Profile emails unavailable. Contact your developer if you need this feature.
        </p>
      </CardContent>
    </Card>
  );
};

export default InviteAdminForm;
