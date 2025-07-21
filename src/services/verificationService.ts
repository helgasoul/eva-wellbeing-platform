
// Mock verification service for m4p version
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
};

export const verificationService = {
  sendEmailCode: async (email: string) => {
    // Mock implementation for m4p
    return {
      success: true,
      message: 'Код отправлен на email'
    };
  },

  verifyEmailCode: async (email: string, code: string) => {
    // Mock implementation for m4p
    return {
      success: true,
      message: 'Email подтвержден'
    };
  },

  sendPhoneCode: async (phone: string) => {
    // Mock implementation for m4p
    return {
      success: true,
      message: 'Код отправлен по SMS'
    };
  },

  verifyPhoneCode: async (phone: string, code: string) => {
    // Mock implementation for m4p
    return {
      success: true,
      message: 'Телефон подтвержден'
    };
  }
};
