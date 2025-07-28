
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasLoginHistory } from '@/utils/authUtils';
import LandingPage from '@/components/landing/LandingPage';

const HomePage = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after auth is loaded to avoid race conditions
    if (!loading && hasLoginHistory()) {
      navigate('/all-products', { replace: true });
    }
  }, [loading, navigate]);

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

  // Show landing page only to users without login history
  return <LandingPage />;
};

export default HomePage;
