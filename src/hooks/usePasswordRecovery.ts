
import { useState, useEffect } from 'react';

export const usePasswordRecovery = () => {
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const checkPasswordRecovery = () => {
    const url = window.location.href;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    const searchParams = new URLSearchParams(search);
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
    
    const hasAccessToken = Boolean(searchParams.get('access_token') || hashParams?.get('access_token'));
    const hasRefreshToken = Boolean(searchParams.get('refresh_token') || hashParams?.get('refresh_token'));
    const hasType = (searchParams.get('type') === 'recovery') || (hashParams?.get('type') === 'recovery');
    
    const isOnSetPasswordPage = pathname === '/set-password';
    const hasRecoveryFlag = Boolean(sessionStorage.getItem('supabase-recovery-session'));
    
    const hasRecoveryTokens = Boolean(
      hasAccessToken || 
      hasRefreshToken || 
      hasType ||
      (isOnSetPasswordPage && hasRecoveryFlag)
    );
    
    if (hasAccessToken || hasRefreshToken || hasType || (isOnSetPasswordPage && hasRecoveryFlag)) {
      sessionStorage.setItem('supabase-recovery-session', 'true');
    }
    
    if (!isOnSetPasswordPage && !hasAccessToken && !hasRefreshToken && !hasType) {
      sessionStorage.removeItem('supabase-recovery-session');
    }
    
    setIsPasswordRecovery(hasRecoveryTokens);
    return hasRecoveryTokens;
  };

  useEffect(() => {
    checkPasswordRecovery();
    
    const handleUrlChange = () => {
      checkPasswordRecovery();
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery };
};
