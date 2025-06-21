
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
    
    const hasAccessToken = !!(searchParams.get('access_token') || hashParams?.get('access_token'));
    const hasRefreshToken = !!(searchParams.get('refresh_token') || hashParams?.get('refresh_token'));
    const hasType = (searchParams.get('type') === 'recovery') || (hashParams?.get('type') === 'recovery');
    
    // Check if we're on set-password page (this often means we came from a recovery link)
    const isOnSetPasswordPage = pathname === '/set-password';
    
    // Check if there's a recent recovery flag in sessionStorage
    const hasRecentRecovery = Boolean(sessionStorage.getItem('supabase-recovery-session'));
    
    const hasRecoveryTokens = Boolean(
      (hasAccessToken && hasRefreshToken) ||
      hasType ||
      (isOnSetPasswordPage && hasRecentRecovery) ||
      isOnSetPasswordPage // Assume /set-password page means recovery for now
    );
    
    console.log('🔍 PasswordRecovery: DETAILED password recovery check:', { 
      hasRecoveryTokens,
      currentUrl: url,
      pathname,
      search,
      hash,
      hasAccessToken,
      hasRefreshToken,
      hasType,
      isOnSetPasswordPage,
      hasRecentRecovery,
      typeValue: searchParams.get('type') || hashParams?.get('type')
    });
    
    // Set recovery flag in sessionStorage if we detect recovery tokens
    if (hasAccessToken || hasRefreshToken || hasType) {
      sessionStorage.setItem('supabase-recovery-session', 'true');
    }
    
    // Clear recovery flag if we're not on set-password page and no tokens
    if (!isOnSetPasswordPage && !hasAccessToken && !hasRefreshToken && !hasType) {
      sessionStorage.removeItem('supabase-recovery-session');
    }
    
    setIsPasswordRecovery(hasRecoveryTokens);
    return hasRecoveryTokens;
  };

  useEffect(() => {
    console.log('🔍 PasswordRecovery: Hook initializing...');
    checkPasswordRecovery();
  }, []);

  return { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery };
};
