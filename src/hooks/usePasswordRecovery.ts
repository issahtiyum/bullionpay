
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
    
    const hasRecoveryTokens = Boolean(
      (hasAccessToken && hasRefreshToken) ||
      hasType ||
      (pathname === '/set-password')
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
      typeValue: searchParams.get('type') || hashParams?.get('type')
    });
    
    setIsPasswordRecovery(hasRecoveryTokens);
    return hasRecoveryTokens;
  };

  useEffect(() => {
    console.log('🔍 PasswordRecovery: Hook initializing...');
    checkPasswordRecovery();
  }, []);

  return { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery };
};
