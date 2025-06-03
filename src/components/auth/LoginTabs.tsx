
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

type ContactMethod = 'email' | 'phone';

type LoginTabsProps = {
  isSignUp: boolean;
  onTabChange: (value: string) => void;
  onLoginSubmit: (contactMethod: ContactMethod, contactValue: string, password?: string) => Promise<void>;
  onSignupSubmit: (
    contactMethod: ContactMethod, 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password?: string
  ) => Promise<void>;
  onForgotPassword: () => void;
  loading: boolean;
};

const LoginTabs = ({ 
  isSignUp, 
  onTabChange, 
  onLoginSubmit, 
  onSignupSubmit, 
  onForgotPassword, 
  loading 
}: LoginTabsProps) => {
  return (
    <Tabs value={isSignUp ? 'signup' : 'login'} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4 mt-4">
        <LoginForm 
          onSubmit={onLoginSubmit} 
          onForgotPassword={onForgotPassword}
          loading={loading} 
        />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4 mt-4">
        <SignupForm onSubmit={onSignupSubmit} loading={loading} />
      </TabsContent>
    </Tabs>
  );
};

export default LoginTabs;
