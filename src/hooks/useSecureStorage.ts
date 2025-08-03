
import { useState, useEffect } from 'react';

// Secure storage utilities with encryption simulation
export const useSecureStorage = () => {
  const encrypt = (data: string): string => {
    // Simple base64 encoding for client-side obfuscation
    // In production, use proper encryption library
    return btoa(data);
  };

  const decrypt = (encryptedData: string): string => {
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  };

  const setSecureItem = (key: string, value: string): void => {
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.warn('Failed to store secure item:', error);
    }
  };

  const getSecureItem = (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      return decrypt(encrypted);
    } catch (error) {
      console.warn('Failed to retrieve secure item:', error);
      return null;
    }
  };

  const removeSecureItem = (key: string): void => {
    try {
      localStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.warn('Failed to remove secure item:', error);
    }
  };

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem
  };
};

export const useSecureState = <T>(key: string, initialValue: T) => {
  const { setSecureItem, getSecureItem, removeSecureItem } = useSecureStorage();
  
  const [state, setState] = useState<T>(() => {
    try {
      const stored = getSecureItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      setSecureItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to store secure state:', error);
    }
  }, [key, state, setSecureItem]);

  const clearSecureState = () => {
    removeSecureItem(key);
    setState(initialValue);
  };

  return [state, setState, clearSecureState] as const;
};
