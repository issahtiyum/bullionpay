
import React from 'react';

type DebugInfoProps = {
  tokens: { accessToken: string | null; refreshToken: string | null; type: string | null } | null;
  sessionEstablished: boolean;
  isPasswordRecovery: boolean;
};

const PasswordResetDebugInfo = ({ tokens, sessionEstablished, isPasswordRecovery }: DebugInfoProps) => {
  const debugInfo = {
    currentPath: window.location.pathname,
    hasTokens: !!tokens,
    sessionEstablished,
    isPasswordRecovery,
    fullUrl: window.location.href,
    search: window.location.search,
    hash: window.location.hash,
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg text-left">
      <h3 className="font-semibold mb-2">Debug Information:</h3>
      <pre className="text-xs overflow-auto whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="mt-2 text-sm text-gray-600">
        <p><strong>Expected:</strong> You should be on /set-password with tokens in the URL</p>
        <p><strong>Current path:</strong> {window.location.pathname}</p>
        <p><strong>Has tokens:</strong> {tokens ? 'Yes' : 'No'}</p>
        <p><strong>Session established:</strong> {sessionEstablished ? 'Yes' : 'No'}</p>
        <p><strong>Is password recovery:</strong> {isPasswordRecovery ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default PasswordResetDebugInfo;
