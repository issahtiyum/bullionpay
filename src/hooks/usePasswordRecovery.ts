
import { useState, useEffect } from 'react';

export const usePasswordRecovery = () => {
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const checkPasswordRecovery = () => {
    const url = window.location.href;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Check for recovery tokens in URL params or hash
    const searchParams = new URLSearchParams(search);
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null;
    
    const hasAccessToken = Boolean(searchParams.get('access_token') || hashParams?.get('access_token'));
    const hasRefreshToken = Boolean(searchParams.get('refresh_token') || hashParams?.get('refresh_token'));
    const hasType = (searchParams.get('type') === 'recovery') || (hashParams?.get('type') === 'recovery');
    
    // Check if we're on set-password page
    const isOnSetPasswordPage = pathname === '/set-password';
    
    // Check if there's a recovery flag in sessionStorage
    const hasRecoveryFlag = Boolean(sessionStorage.getItem('supabase-recovery-session'));
    
    // Enhanced recovery detection logic
    const hasRecoveryTokens = Boolean(
      hasAccessToken || 
      hasRefreshToken || 
      hasType ||
      (isOnSetPasswordPage && hasRecoveryFlag)
    );
    
    // Set recovery flag if we detect tokens or are on set-password page with existing flag
    if (hasAccessToken || hasRefreshToken || hasType || (isOnSetPasswordPage && hasRecoveryFlag)) {
      sessionStorage.setItem('supabase-recovery-session', 'true');
    }
    
    // Only clear recovery flag if we're definitely not in recovery mode
    if (!isOnSetPasswordPage && !hasAccessToken && !hasRefreshToken && !hasType) {
      sessionStorage.removeItem('supabase-recovery-session');
    }
    
    setIsPasswordRecovery(hasRecoveryTokens);
    return hasRecoveryTokens;
  };

  useEffect(() => {
    checkPasswordRecovery();
    
    // Listen for URL changes (like when tokens are parsed and URL is cleaned)
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
