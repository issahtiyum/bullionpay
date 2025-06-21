
export const generatePaymentReference = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `bullion_${timestamp}_${random}`;
};

export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load payment system'));
    document.head.appendChild(script);
  });
};
