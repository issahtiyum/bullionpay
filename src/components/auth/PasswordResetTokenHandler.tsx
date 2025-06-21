
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
      const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
      
      const searchParams = new URLSearchParams(window.location.search);
      let accessToken = searchParams.get('access_token');
      let refreshToken = searchParams.get('refresh_token');
      let type = searchParams.get('type');

      if (!accessToken && !refreshToken) {
        const hash = window.location.hash.substring(1);
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
        }
      }

      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            toast({
              title: "Invalid reset link",
              description: "This password reset link is invalid or has expired",
              variant: "destructive",
            });
            onTokensInvalid();
            navigate('/reset-password');
            return;
          }

          sessionStorage.setItem('supabase-recovery-session', 'true');
          onTokensEstablished({ accessToken, refreshToken, type });
          
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process reset link",
            variant: "destructive",
          });
          onTokensInvalid();
          navigate('/reset-password');
        }
      } 
      else if (existingSession && window.location.pathname === '/set-password') {
        sessionStorage.setItem('supabase-recovery-session', 'true');
        onTokensEstablished({ 
          accessToken: existingSession.access_token, 
          refreshToken: existingSession.refresh_token, 
          type: 'recovery' 
        });
      }
      else {
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

  return null;
};

export default PasswordResetTokenHandler;
