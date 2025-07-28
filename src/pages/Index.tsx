
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasLoginHistory } from '@/utils/authUtils';
import LandingPage from '@/components/landing/LandingPage';

const HomePage = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is authenticated AND has login history
    if (!loading && isAuthenticated && hasLoginHistory()) {
      navigate('/all-products', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bullion-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page to unauthenticated users or authenticated users without login history
  return <LandingPage />;
};

export default HomePage;
