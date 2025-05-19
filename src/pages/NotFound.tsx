
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-bullion-purple-100 p-6 mb-6">
          <div className="text-6xl font-bold text-bullion-purple-600">404</div>
        </div>
        <h1 className="text-3xl font-semibold mb-4 text-center">Page not found</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="bg-gradient-bullion hover:opacity-90">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
