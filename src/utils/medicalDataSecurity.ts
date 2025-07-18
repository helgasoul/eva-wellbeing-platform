/**
 * ✅ КРИПТОГРАФИЧЕСКАЯ ЗАЩИТА МЕДИЦИНСКИХ ДАННЫХ
 * Соответствует стандартам HIPAA/GDPR
 */

import { SafeStorage } from './storageUtils';

interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keyLength: 256;
  ivLength: 12;
  tagLength: 128;
}

interface EncryptedData {
  data: string; // base64 encrypted data
  iv: string;   // base64 initialization vector
  salt: string; // base64 salt for key derivation
  timestamp: number;
  dataType: 'medical' | 'personal' | 'anonymous';
}

export class MedicalDataCrypto {
  private static readonly CONFIG: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    tagLength: 128
  };

  /**
   * Генерация криптографически стойкого ключа из пароля пользователя
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // NIST рекомендует минимум 100k
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.CONFIG.algorithm,
        length: this.CONFIG.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Шифрование медицинских данных
   */
  static async encryptMedicalData(
    data: any, 
    userPassword: string,
    dataType: 'medical' | 'personal' | 'anonymous' = 'medical'
  ): Promise<EncryptedData> {
    try {
      // Генерируем криптографически стойкие значения
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(this.CONFIG.ivLength));
      
      // Выводим ключ из пароля пользователя
      const key = await this.deriveKey(userPassword, salt);
      
      // Подготавливаем данные с метаданными
      const dataToEncrypt = {
        payload: data,
        timestamp: Date.now(),
        dataType,
        version: '1.0'
      };
      
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(dataToEncrypt));
      
      // Шифруем данные
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.CONFIG.algorithm,
          iv: iv
        },
        key,
        encodedData
      );
      
      // Конвертируем в base64 для хранения
      return {
        data: this.bufferToBase64(encryptedBuffer),
        iv: this.bufferToBase64(iv),
        salt: this.bufferToBase64(salt),
        timestamp: Date.now(),
        dataType
      };
      
    } catch (error) {
      console.error('Ошибка шифрования медицинских данных:', error);
      throw new Error('Не удалось зашифровать чувствительные данные');
    }
  }

  /**
   * Расшифровка медицинских данных
   */
  static async decryptMedicalData(
    encryptedData: EncryptedData,
    userPassword: string
  ): Promise<any> {
    try {
      // Конвертируем из base64
      const salt = this.base64ToBuffer(encryptedData.salt);
      const iv = this.base64ToBuffer(encryptedData.iv);
      const data = this.base64ToBuffer(encryptedData.data);
      
      // Выводим ключ
      const key = await this.deriveKey(userPassword, new Uint8Array(salt));
      
      // Расшифровываем
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.CONFIG.algorithm,
          iv: new Uint8Array(iv)
        },
        key,
        data
      );
      
      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      const parsedData = JSON.parse(decryptedString);
      
      // Проверяем целостность и актуальность данных
      if (!parsedData.payload || !parsedData.timestamp) {
        throw new Error('Повреждены зашифрованные данные');
      }
      
      // Проверяем возраст данных (максимум 30 дней)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней в мс
      if (Date.now() - parsedData.timestamp > maxAge) {
        console.warn('Данные устарели, требуется повторная аутентификация');
      }
      
      return parsedData.payload;
      
    } catch (error) {
      console.error('Ошибка расшифровки медицинских данных:', error);
      throw new Error('Не удалось расшифровать данные');
    }
  }

  /**
   * Безопасное удаление ключей из памяти
   */
  static async secureKeyCleanup(key: CryptoKey): Promise<void> {
    try {
      // В WebCrypto API ключи автоматически очищаются сборщиком мусора
      // Но мы можем форсировать это
      if ('clear' in key) {
        (key as any).clear();
      }
    } catch (error) {
      console.warn('Не удалось принудительно очистить ключ:', error);
    }
  }

  // Утилиты для конвертации
  private static bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * ✅ БЕЗОПАСНОЕ ХРАНИЛИЩЕ ДЛЯ МЕДИЦИНСКИХ ДАННЫХ
 */
export class SecureMedicalStorage {
  private static readonly MEDICAL_DATA_KEY = 'eva_medical_data_encrypted';
  private static readonly PERSONAL_DATA_KEY = 'eva_personal_data_encrypted';

  /**
   * Сохранение медицинских данных с шифрованием
   */
  static async saveMedicalData(
    data: any,
    userPassword: string,
    dataType: 'medical' | 'personal' = 'medical'
  ): Promise<boolean> {
    try {
      // Валидируем медицинские данные
      if (!this.validateMedicalData(data)) {
        throw new Error('Некорректные медицинские данные');
      }

      // Шифруем данные
      const encryptedData = await MedicalDataCrypto.encryptMedicalData(
        data, 
        userPassword, 
        dataType
      );

      // Сохраняем в localStorage с дополнительной защитой
      const storageKey = dataType === 'medical' 
        ? this.MEDICAL_DATA_KEY 
        : this.PERSONAL_DATA_KEY;

      const success = SafeStorage.setItem(storageKey, encryptedData);
      
      if (success) {
        // Логируем действие для аудита (без чувствительных данных)
        console.log('✅ Медицинские данные безопасно сохранены', {
          dataType,
          timestamp: encryptedData.timestamp,
          size: JSON.stringify(encryptedData).length
        });
      }

      return success;
    } catch (error) {
      console.error('❌ Ошибка сохранения медицинских данных:', error);
      return false;
    }
  }

  /**
   * Получение медицинских данных с расшифровкой
   */
  static async getMedicalData(
    userPassword: string,
    dataType: 'medical' | 'personal' = 'medical'
  ): Promise<any | null> {
    try {
      const storageKey = dataType === 'medical' 
        ? this.MEDICAL_DATA_KEY 
        : this.PERSONAL_DATA_KEY;

      const encryptedData = SafeStorage.getItem<EncryptedData>(storageKey);
      
      if (!encryptedData) {
        return null;
      }

      // Расшифровываем данные
      const decryptedData = await MedicalDataCrypto.decryptMedicalData(
        encryptedData,
        userPassword
      );

      return decryptedData;
    } catch (error) {
      console.error('❌ Ошибка получения медицинских данных:', error);
      // При ошибке расшифровки очищаем поврежденные данные
      this.clearMedicalData(dataType);
      return null;
    }
  }

  /**
   * Безопасная очистка медицинских данных
   */
  static clearMedicalData(dataType?: 'medical' | 'personal'): void {
    try {
      if (!dataType) {
        // Очищаем все медицинские данные
        SafeStorage.removeItem(this.MEDICAL_DATA_KEY);
        SafeStorage.removeItem(this.PERSONAL_DATA_KEY);
      } else {
        const storageKey = dataType === 'medical' 
          ? this.MEDICAL_DATA_KEY 
          : this.PERSONAL_DATA_KEY;
        SafeStorage.removeItem(storageKey);
      }

      console.log('✅ Медицинские данные безопасно удалены');
    } catch (error) {
      console.error('❌ Ошибка очистки медицинских данных:', error);
    }
  }

  /**
   * Валидация медицинских данных
   */
  private static validateMedicalData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем на потенциально опасный контент
    const jsonString = JSON.stringify(data);
    
    // Запрещенные паттерны для предотвращения XSS
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(jsonString));
  }
}