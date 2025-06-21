
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Download, User } from 'lucide-react';

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleDownloadData = () => {
    toast({
      title: "Data export requested",
      description: "Your account data will be prepared and sent to your email within 24 hours.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Account Information
          </CardTitle>
          <CardDescription>
            Basic information about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Account ID</span>
            <span className="text-sm text-gray-600 font-mono">{user?.id?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Email</span>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Account Created</span>
            <span className="text-sm text-gray-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Data Export
          </CardTitle>
          <CardDescription>
            Download a copy of your account data and purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleDownloadData}
            className="w-full sm:w-auto"
          >
            <Download size={16} className="mr-2" />
            Request Data Export
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Delete Account</h4>
            <p className="text-sm text-gray-600">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
