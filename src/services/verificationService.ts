interface VerificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface VerificationService {
  sendEmailCode(email: string): Promise<VerificationResponse>;
  verifyEmailCode(email: string, code: string): Promise<VerificationResponse>;
  sendPhoneCode(phone: string): Promise<VerificationResponse>;
  verifyPhoneCode(phone: string, code: string): Promise<VerificationResponse>;
}

// Демо-реализация для тестирования
// В продакшене заменить на реальные API вызовы
class MockVerificationService implements VerificationService {
  private sentCodes: Record<string, string> = {};

  async sendEmailCode(email: string): Promise<VerificationResponse> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Генерируем случайный код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.sentCodes[email] = code;

    // В реальности здесь был бы вызов email-сервиса
    console.log(`📧 Код верификации для ${email}: ${code}`);

    return {
      success: true,
      message: `Код верификации отправлен на ${email}`
    };
  }

  async verifyEmailCode(email: string, code: string): Promise<VerificationResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const sentCode = this.sentCodes[email];
    
    if (!sentCode) {
      return {
        success: false,
        message: 'Код не был отправлен',
        error: 'CODE_NOT_SENT'
      };
    }

    if (sentCode === code || code === '123456') { // Универсальный тестовый код
      // Удаляем использованный код
      delete this.sentCodes[email];
      
      return {
        success: true,
        message: 'Email успешно подтвержден'
      };
    }

    return {
      success: false,
      message: 'Неверный код верификации',
      error: 'INVALID_CODE'
    };
  }

  async sendPhoneCode(phone: string): Promise<VerificationResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.sentCodes[phone] = code;

    console.log(`📱 SMS код для ${phone}: ${code}`);

    return {
      success: true,
      message: `Код отправлен на номер ${phone}`
    };
  }

  async verifyPhoneCode(phone: string, code: string): Promise<VerificationResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const sentCode = this.sentCodes[phone];
    
    if (!sentCode) {
      return {
        success: false,
        message: 'Код не был отправлен',
        error: 'CODE_NOT_SENT'
      };
    }

    if (sentCode === code || code === '1234') { // Универсальный тестовый код
      delete this.sentCodes[phone];
      
      return {
        success: true,
        message: 'Телефон успешно подтвержден'
      };
    }

    return {
      success: false,
      message: 'Неверный код верификации',
      error: 'INVALID_CODE'
    };
  }
}

// Экспортируем singleton instance
export const verificationService = new MockVerificationService();

// Утилиты для валидации
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{10,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '+7' + cleaned.slice(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  return phone;
};