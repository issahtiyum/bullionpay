
import MainLayout from '@/components/layout/MainLayout';
import LoginContainer from '@/components/auth/LoginContainer';

const Login = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <LoginContainer />
      </div>
    </MainLayout>
  );
};

export default Login;
