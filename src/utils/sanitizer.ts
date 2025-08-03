
import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML rendering
const createDOMPurify = () => {
  if (typeof window !== 'undefined') {
    return DOMPurify;
  }
  // For server-side rendering, return a mock that strips all HTML
  return {
    sanitize: (dirty: string) => dirty.replace(/<[^>]*>/g, '')
  };
};

const purify = createDOMPurify();

export const sanitizeHtml = (dirty: string): string => {
  if (typeof window !== 'undefined') {
    // Configure DOMPurify with allowed tags and attributes
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }
  // For server-side, strip all HTML
  return dirty.replace(/<[^>]*>/g, '');
};

export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>'"&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
};

export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  name: (name: string): boolean => {
    return name.length >= 1 && name.length <= 100 && !/[<>'"&]/.test(name);
  },
  
  customField: (value: string, type: string): boolean => {
    if (value.length > 1000) return false;
    
    switch (type) {
      case 'email':
        return validateInput.email(value);
      case 'tel':
        return validateInput.phone(value);
      case 'number':
        return !isNaN(Number(value)) && value.length <= 20;
      case 'url':
        try {
          new URL(value);
          return value.length <= 500;
        } catch {
          return false;
        }
      default:
        return !/[<>'"&]/.test(value);
    }
  }
};
