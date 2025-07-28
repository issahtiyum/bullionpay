
export const LOGIN_HISTORY_KEY = 'bullionpay_login_history';

export const hasLoginHistory = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LOGIN_HISTORY_KEY) === 'true';
};

export const setLoginHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOGIN_HISTORY_KEY, 'true');
};

export const clearLoginHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOGIN_HISTORY_KEY);
};

export const getHomeRoute = (): string => {
  return hasLoginHistory() ? '/all-products' : '/';
};
