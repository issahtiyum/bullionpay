
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type PasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

const PasswordForm = () => {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      const { error } = await updatePassword(data.newPassword);

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Change Password</h3>
        <p className="text-sm text-gray-600">
          Choose a strong password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              }
            })}
            placeholder="Enter new password"
          />
          {errors.newPassword && (
            <p className="text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-bullion hover:opacity-90"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};

export default PasswordForm;
