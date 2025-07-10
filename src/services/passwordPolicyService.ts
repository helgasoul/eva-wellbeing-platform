// ✅ ЭТАП 4: Enhanced Password Policy Service
import { authAuditService } from './authAuditService';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidPersonalInfo: boolean;
  passwordHistoryCount: number;
  maxRepeatingChars: number;
  minPasswordAge: number; // hours
  maxPasswordAge: number; // days
}

export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    noCommonPatterns: boolean;
    noRepeatingChars: boolean;
  };
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: PasswordStrength;
}

// Default enterprise-grade policy
const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
  forbidPersonalInfo: true,
  passwordHistoryCount: 12,
  maxRepeatingChars: 2,
  minPasswordAge: 24, // 24 hours
  maxPasswordAge: 90  // 90 days
};

// Common passwords list (top 100 most common passwords)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567', 
  '1234567890', 'qwerty', 'abc123', 'password123', 'admin', 'letmein',
  'welcome', 'monkey', 'dragon', 'master', 'hello', 'freedom', 'whatever',
  'qazwsx', '123qwe', 'zxcvbnm', 'trustno1', 'adobe123', '123123',
  'azerty', '0', 'iloveyou', 'aaaaaa', '654321', '666666', 'wow',
  'qwerty123', 'qwertyuiop', '123321', 'lovely', '7777777', '888888',
  'princess', 'password1', '111111', 'sunshine', '1qaz2wsx', 'superman'
]);

// Special characters regex
const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

class PasswordPolicyService {
  private policy: PasswordPolicy = DEFAULT_POLICY;

  // Load policy from configuration or database
  async loadPolicy(): Promise<PasswordPolicy> {
    try {
      // In a real implementation, this would load from database or config
      // For now, return the default policy
      return this.policy;
    } catch (error) {
      console.warn('Failed to load password policy, using defaults:', error);
      return DEFAULT_POLICY;
    }
  }

  // Update policy (admin only)
  async updatePolicy(newPolicy: Partial<PasswordPolicy>): Promise<void> {
    try {
      this.policy = { ...this.policy, ...newPolicy };
      // In a real implementation, this would save to database
      await authAuditService.logPasswordPolicyEvent(
        'policy_updated',
        true,
        { updatedFields: Object.keys(newPolicy) },
        'high'
      );
    } catch (error) {
      console.error('Failed to update password policy:', error);
      throw error;
    }
  }

  // Get current policy
  getCurrentPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  // Validate password against policy
  async validatePassword(
    password: string, 
    userInfo?: { email?: string; firstName?: string; lastName?: string; userId?: string }
  ): Promise<PasswordValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Length validation
    if (password.length < this.policy.minLength) {
      errors.push(`Пароль должен содержать минимум ${this.policy.minLength} символов`);
    }
    if (password.length > this.policy.maxLength) {
      errors.push(`Пароль должен содержать максимум ${this.policy.maxLength} символов`);
    }

    // Character type requirements
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }
    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }
    if (this.policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }
    if (this.policy.requireSpecialChars && !SPECIAL_CHARS_REGEX.test(password)) {
      errors.push('Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)');
    }

    // Common password check
    if (this.policy.forbidCommonPasswords && this.isCommonPassword(password)) {
      errors.push('Этот пароль слишком распространен. Выберите более уникальный пароль');
    }

    // Personal info check
    if (this.policy.forbidPersonalInfo && userInfo && this.containsPersonalInfo(password, userInfo)) {
      errors.push('Пароль не должен содержать ваши личные данные (имя, email)');
    }

    // Repeating characters check
    if (this.hasExcessiveRepeatingChars(password)) {
      errors.push(`Пароль не должен содержать более ${this.policy.maxRepeatingChars} одинаковых символов подряд`);
    }

    // Calculate password strength
    const strength = this.calculatePasswordStrength(password);

    // Add warnings for weak passwords
    if (strength.score < 2) {
      warnings.push('Пароль слишком слабый. Рекомендуется усилить его');
    } else if (strength.score < 3) {
      warnings.push('Пароль средней силы. Можно улучшить для большей безопасности');
    }

    // Check password history if user provided
    if (userInfo?.userId) {
      const isReused = await this.checkPasswordHistory(password, userInfo.userId);
      if (isReused) {
        errors.push(`Нельзя использовать один из ${this.policy.passwordHistoryCount} предыдущих паролей`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strength
    };
  }

  // Calculate password strength score
  private calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];
    
    const requirements = {
      minLength: password.length >= this.policy.minLength,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: SPECIAL_CHARS_REGEX.test(password),
      noCommonPatterns: !this.hasCommonPatterns(password),
      noRepeatingChars: !this.hasExcessiveRepeatingChars(password)
    };

    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety scoring
    if (requirements.hasUppercase && requirements.hasLowercase) score += 1;
    if (requirements.hasNumbers) score += 1;
    if (requirements.hasSpecialChars) score += 1;

    // Pattern checks
    if (requirements.noCommonPatterns) score += 1;
    if (!this.isCommonPassword(password)) score += 1;

    // Cap at 4 (very strong)
    score = Math.min(score, 4);

    // Generate feedback
    if (!requirements.minLength) {
      feedback.push(`Увеличьте длину до ${this.policy.minLength} символов`);
    }
    if (!requirements.hasUppercase) {
      feedback.push('Добавьте заглавные буквы');
    }
    if (!requirements.hasLowercase) {
      feedback.push('Добавьте строчные буквы');
    }
    if (!requirements.hasNumbers) {
      feedback.push('Добавьте цифры');
    }
    if (!requirements.hasSpecialChars) {
      feedback.push('Добавьте специальные символы');
    }
    if (!requirements.noCommonPatterns) {
      feedback.push('Избегайте простых паттернов (123, abc, qwerty)');
    }

    if (score >= 3 && feedback.length === 0) {
      feedback.push('Отличный пароль!');
    }

    return {
      score,
      feedback,
      requirements
    };
  }

  // Check if password is in common passwords list
  private isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.has(password.toLowerCase());
  }

  // Check if password contains personal information
  private containsPersonalInfo(password: string, userInfo: { email?: string; firstName?: string; lastName?: string }): boolean {
    const lowerPassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts) && emailParts.length > 2) {
        return true;
      }
    }
    
    if (userInfo.firstName && userInfo.firstName.length > 2) {
      if (lowerPassword.includes(userInfo.firstName.toLowerCase())) {
        return true;
      }
    }
    
    if (userInfo.lastName && userInfo.lastName.length > 2) {
      if (lowerPassword.includes(userInfo.lastName.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  // Check for excessive repeating characters
  private hasExcessiveRepeatingChars(password: string): boolean {
    let maxRepeating = 1;
    let currentRepeating = 1;
    
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        currentRepeating++;
        maxRepeating = Math.max(maxRepeating, currentRepeating);
      } else {
        currentRepeating = 1;
      }
    }
    
    return maxRepeating > this.policy.maxRepeatingChars;
  }

  // Check for common patterns
  private hasCommonPatterns(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    
    // Sequential patterns
    const sequences = [
      '123456789', 'abcdefghijklmnopqrstuvwxyz', 
      'qwertyuiopasdfghjklzxcvbnm', '987654321'
    ];
    
    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 4; i++) {
        const subseq = sequence.substring(i, i + 4);
        if (lowerPassword.includes(subseq)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Check password against history (simplified implementation)
  private async checkPasswordHistory(password: string, userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check against stored password hashes
      // For now, return false (not reused)
      return false;
    } catch (error) {
      console.warn('Failed to check password history:', error);
      return false;
    }
  }

  // Generate secure password suggestion
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure we have at least one of each required type
    if (this.policy.requireUppercase) password += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (this.policy.requireLowercase) password += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (this.policy.requireNumbers) password += numbers[Math.floor(Math.random() * numbers.length)];
    if (this.policy.requireSpecialChars) password += specials[Math.floor(Math.random() * specials.length)];
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + specials;
    while (password.length < length) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export const passwordPolicyService = new PasswordPolicyService();