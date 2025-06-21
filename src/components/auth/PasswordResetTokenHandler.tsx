
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type TokenInfo = {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
};

type TokenHandlerProps = {
  onTokensEstablished: (tokens: TokenInfo) => void;
  onTokensInvalid: () => void;
};

const PasswordResetTokenHandler = ({ onTokensEstablished, onTokensInvalid }: TokenHandlerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const parseAndEstablishTokens = async () => {
      const currentUrl = window.location.href;
      console.log('🔍 TokenHandler: Starting token parsing for URL:', currentUrl);
      
      // First check if we already have an active session
      const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 TokenHandler: Existing session check:', { 
        hasSession: !!existingSession, 
        error: sessionError,
        userEmail: existingSession?.user?.email 
      });
      
      // Parse tokens from URL
      const searchParams = new URLSearchParams(window.location.search);
      let accessToken = searchParams.get('access_token');
      let refreshToken = searchParams.get('refresh_token');
      let type = searchParams.get('type');

      // Check URL fragment if not in search params
      if (!accessToken && !refreshToken) {
        const hash = window.location.hash.substring(1);
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
        }
      }

      console.log('🔍 TokenHandler: Parsed tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });

      // If we have tokens, establish the session
      if (accessToken && refreshToken) {
        console.log('🔍 TokenHandler: Found tokens, establishing session...');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('❌ TokenHandler: Session establishment failed:', error);
            toast({
              title: "Invalid reset link",
              description: "This password reset link is invalid or has expired",
              variant: "destructive",
            });
            onTokensInvalid();
            navigate('/reset-password');
            return;
          }

          console.log('✅ TokenHandler: Session established successfully');
          sessionStorage.setItem('supabase-recovery-session', 'true');
          onTokensEstablished({ accessToken, refreshToken, type });
          
          // Clean up URL to remove tokens
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
        } catch (error) {
          console.error('❌ TokenHandler: Exception during session establishment:', error);
          toast({
            title: "Error",
            description: "Failed to process reset link",
            variant: "destructive",
          });
          onTokensInvalid();
          navigate('/reset-password');
        }
      } 
      // If we have an existing session and we're on the set-password page, treat as recovery
      else if (existingSession && window.location.pathname === '/set-password') {
        console.log('🔍 TokenHandler: Using existing session for password recovery');
        sessionStorage.setItem('supabase-recovery-session', 'true');
        onTokensEstablished({ 
          accessToken: existingSession.access_token, 
          refreshToken: existingSession.refresh_token, 
          type: 'recovery' 
        });
      }
      // No tokens and no valid session - invalid link
      else {
        console.log('❌ TokenHandler: No tokens and no valid session');
        // Only show error if we're not already processing
        if (!sessionStorage.getItem('supabase-recovery-session')) {
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive",
          });
          onTokensInvalid();
          navigate('/reset-password');
        }
      }
    };

    parseAndEstablishTokens();
  }, [onTokensEstablished, onTokensInvalid, toast, navigate]);

  return null; // This component doesn't render anything
};

export default PasswordResetTokenHandler;
