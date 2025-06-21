
import { useState, useEffect } from 'react';

export const usePasswordRecovery = () => {
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const checkPasswordRecovery = () => {
    const url = window.location.href;
    const hasRecoveryTokens = (
      (url.includes('access_token') && url.includes('refresh_token')) ||
      (url.includes('type=recovery')) ||
      window.location.pathname === '/set-password'
    );
    
    console.log('🔍 PasswordRecovery: Enhanced password recovery check:', { 
      hasRecoveryTokens, 
      currentUrl: url,
      pathname: window.location.pathname
    });
    
    setIsPasswordRecovery(hasRecoveryTokens);
    return hasRecoveryTokens;
  };

  useEffect(() => {
    checkPasswordRecovery();
  }, []);

  return { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery };
};
