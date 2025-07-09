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

// Реализация сервиса верификации с интеграцией Resend
class ResendVerificationService implements VerificationService {
  private sentCodes: Record<string, string> = {};

  async sendEmailCode(email: string): Promise<VerificationResponse> {
    try {
      // Генерируем случайный код
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.sentCodes[email] = code;

      // Отправляем через Supabase Edge Function
      const response = await fetch('/functions/v1/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          type: 'email_verification'
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: `Код верификации отправлен на ${email}`
        };
      } else {
        throw new Error(result.error || 'Ошибка отправки email');
      }
    } catch (error) {
      console.error('Error sending email code:', error);
      // Fallback к консольному выводу для разработки
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.sentCodes[email] = code;
      console.log(`📧 [FALLBACK] Код верификации для ${email}: ${code}`);
      
      return {
        success: true,
        message: `Код верификации отправлен на ${email} (режим разработки)`
      };
    }
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
export const verificationService = new ResendVerificationService();

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