
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

type DeleteAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type DeleteAccountResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // Validate password
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    // Validate confirmation text
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // First verify the password by attempting to sign in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (authError) {
        toast({
          title: "Invalid password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Call the hybrid deletion function
      const { data, error: dbError } = await supabase.rpc('hybrid_delete_user_account', {
        target_user_id: user.id
      });

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw new Error(dbError.message);
      }

      // Type cast the response to our expected format
      const response = data as DeleteAccountResponse;

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to delete account data');
      }

      // Delete the user from Supabase Auth
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteUserError) {
        console.error('Auth deletion error:', deleteUserError);
        // Don't throw here as the data is already anonymized
        // Just log and continue with logout
      }

      toast({
        title: "Account deleted successfully",
        description: "Your account has been permanently deleted. You will now be logged out.",
      });

      // Wait a moment for the toast to show, then logout
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Failed to delete account",
        description: error.message || "An error occurred while deleting your account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setPassword('');
      setConfirmText('');
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="font-medium text-gray-900">
              This action cannot be undone. This will:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Permanently delete your profile and personal information</li>
              <li>Anonymize your order and transaction history (kept for business records)</li>
              <li>Remove access to your account and all associated data</li>
            </ul>
            <p className="text-sm text-red-600 font-medium">
              Please confirm by entering your password and typing "DELETE" below.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              disabled={isDeleting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Type "DELETE" to confirm</Label>
            <Input
              id="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              disabled={isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting || !password.trim() || confirmText !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountModal;
