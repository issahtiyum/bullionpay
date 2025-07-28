
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/landing/LandingPage';

const HomePage = () => {
  const { loading } = useAuth();

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

  // Always show landing page
  return <LandingPage />;
};

export default HomePage;
