
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const ProfileForm = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.first_name || '');
      setValue('lastName', profile.last_name || '');
      setValue('email', profile.email || user?.email || '');
      setValue('phone', profile.phone || '');
    }
  }, [profile, user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter your email"
          disabled
          className="bg-gray-50"
        />
        <p className="text-sm text-gray-500">
          Email cannot be changed here. Contact support if you need to update your email.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="Enter your phone number"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading || !isDirty}
        className="bg-gradient-bullion hover:opacity-90"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};

export default ProfileForm;
