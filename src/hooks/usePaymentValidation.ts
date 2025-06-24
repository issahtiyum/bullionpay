
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePaymentValidation = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePaymentInputs = (email: string) => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validatePaymentInputs };
};
