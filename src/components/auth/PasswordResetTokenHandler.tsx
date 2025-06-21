
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
      console.log('🔍 TokenHandler: Starting token parsing and session establishment...');
      console.log('🔍 TokenHandler: Current URL:', window.location.href);
      console.log('🔍 TokenHandler: Current search:', window.location.search);
      console.log('🔍 TokenHandler: Current hash:', window.location.hash);
      
      // Parse tokens from URL
      const searchParams = new URLSearchParams(window.location.search);
      let accessToken = searchParams.get('access_token');
      let refreshToken = searchParams.get('refresh_token');
      let type = searchParams.get('type');

      // Check URL fragment if not in search params
      if (!accessToken || !refreshToken) {
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

      // If we don't have tokens, check if there's already an active session
      if (!accessToken || !refreshToken) {
        console.log('🔍 TokenHandler: No tokens found, checking existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 TokenHandler: Existing session check:', { hasSession: !!session, error });
        
        if (session && session.user) {
          console.log('🔍 TokenHandler: Found existing session, treating as recovery session');
          // Set recovery flag since user is on /set-password
          sessionStorage.setItem('supabase-recovery-session', 'true');
          onTokensEstablished({ 
            accessToken: session.access_token, 
            refreshToken: session.refresh_token, 
            type: 'recovery' 
          });
          return;
        }
        
        console.log('❌ TokenHandler: No tokens and no session, invalid reset link');
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        onTokensInvalid();
        navigate('/reset-password');
        return;
      }

      try {
        console.log('🔍 TokenHandler: Establishing session with tokens...');
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
        } else {
          console.log('✅ TokenHandler: Session established successfully');
          // Set recovery flag
          sessionStorage.setItem('supabase-recovery-session', 'true');
          onTokensEstablished({ accessToken, refreshToken, type });
          
          // Clean up URL to remove tokens
          window.history.replaceState({}, document.title, '/set-password');
        }
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
    };

    parseAndEstablishTokens();
  }, [onTokensEstablished, onTokensInvalid, toast, navigate]);

  return null; // This component doesn't render anything
};

export default PasswordResetTokenHandler;
