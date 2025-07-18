import { supabase } from '@/integrations/supabase/client';
import { MedicalDataCrypto, SecureMedicalStorage } from '@/utils/medicalDataSecurity';
import { MedicalSchemas, SecureValidator } from '@/utils/medicalDataValidation';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/types/auth';

/**
 * ✅ ИНТЕГРИРОВАННЫЙ СЕРВИС ДЛЯ БЕЗОПАСНОЙ РАБОТЫ С МЕДИЦИНСКИМИ ДАННЫМИ
 * Объединяет шифрование, валидацию и хранение
 */
export class SecureMedicalDataService {
  private static instance: SecureMedicalDataService;
  private userId: string | null = null;
  private userPassword: string | null = null;

  private constructor() {}

  static getInstance(): SecureMedicalDataService {
    if (!SecureMedicalDataService.instance) {
      SecureMedicalDataService.instance = new SecureMedicalDataService();
    }
    return SecureMedicalDataService.instance;
  }

  /**
   * Инициализация с пользовательскими данными
   */
  async initialize(user: User, password: string): Promise<boolean> {
    try {
      this.userId = user.id;
      this.userPassword = password;
      
      // Тестируем шифрование/расшифровку
      const testData = { test: 'validation' };
      const encrypted = await MedicalDataCrypto.encryptMedicalData(
        testData, 
        password, 
        'personal'
      );
      
      const decrypted = await MedicalDataCrypto.decryptMedicalData(
        encrypted, 
        password
      );
      
      if (JSON.stringify(testData) !== JSON.stringify(decrypted)) {
        throw new Error('Ошибка валидации шифрования');
      }

      console.log('✅ Служба безопасных медицинских данных инициализирована');
      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации службы:', error);
      return false;
    }
  }

  /**
   * Безопасное сохранение симптомов
   */
  async saveSymptoms(symptomsData: any): Promise<boolean> {
    if (!this.validateAuth()) return false;

    try {
      // 1. Валидация данных
      const validation = SecureValidator.validate(
        MedicalSchemas.symptomEntry,
        symptomsData
      );

      if (!validation.success) {
        toast({
          title: 'Ошибка валидации',
          description: validation.errors?.join(', '),
          variant: 'destructive'
        });
        return false;
      }

      // 2. Локальное шифрованное хранение
      const localSaveSuccess = await SecureMedicalStorage.saveMedicalData(
        validation.data,
        this.userPassword!,
        'medical'
      );

      // 3. Безопасное сохранение в Supabase
      if (localSaveSuccess) {
        const encryptedData = await MedicalDataCrypto.encryptMedicalData(
          validation.data,
          this.userPassword!,
          'medical'
        );

        const { data, error } = await supabase
          .rpc('save_encrypted_medical_data', {
            p_user_id: this.userId,
            p_data_type: 'symptoms',
            p_encrypted_content: encryptedData.data,
            p_encryption_metadata: {
              iv: encryptedData.iv,
              salt: encryptedData.salt,
              algorithm: 'AES-GCM',
              timestamp: encryptedData.timestamp
            },
            p_data_hash: await this.generateDataHash(validation.data),
            p_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 год
            p_access_level: 'private'
          });

        if (error) {
          console.error('❌ Ошибка сохранения в Supabase:', error);
          return false;
        }

        toast({
          title: 'Данные сохранены',
          description: 'Симптомы безопасно сохранены'
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Ошибка сохранения симптомов:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные о симптомах',
        variant: 'destructive'
      });
      return false;
    }
  }

  /**
   * Безопасное получение симптомов
   */
  async getSymptoms(): Promise<any[] | null> {
    if (!this.validateAuth()) return null;

    try {
      // 1. Попытка получить из Supabase
      const { data: encryptedRecords, error } = await supabase
        .from('encrypted_medical_data')
        .select('*')
        .eq('user_id', this.userId)
        .eq('data_type', 'symptoms')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && encryptedRecords && encryptedRecords.length > 0) {
        const decryptedSymptoms = [];

        for (const record of encryptedRecords) {
          try {
            const metadata = record.encryption_metadata as any;
            const encryptedData = {
              data: record.encrypted_content,
              iv: metadata.iv as string,
              salt: metadata.salt as string,
              timestamp: metadata.timestamp as number,
              dataType: 'medical' as const
            };

            const decrypted = await MedicalDataCrypto.decryptMedicalData(
              encryptedData,
              this.userPassword!
            );

            // Валидация целостности данных
            const currentHash = await this.generateDataHash(decrypted);
            if (currentHash === record.data_hash) {
              decryptedSymptoms.push({
                ...decrypted,
                id: record.id,
                created_at: record.created_at
              });
            } else {
              console.warn('⚠️ Обнаружены поврежденные данные:', record.id);
            }
          } catch (decryptError) {
            console.error('❌ Ошибка расшифровки записи:', record.id, decryptError);
          }
        }

        return decryptedSymptoms;
      }

      // 2. Fallback: получение из localStorage
      const localData = await SecureMedicalStorage.getMedicalData(
        this.userPassword!,
        'medical'
      );

      return localData ? [localData] : [];
    } catch (error) {
      console.error('❌ Ошибка получения симптомов:', error);
      return null;
    }
  }

  /**
   * Безопасная очистка всех медицинских данных
   */
  async clearAllMedicalData(): Promise<boolean> {
    if (!this.validateAuth()) return false;

    try {
      // 1. Очистка из Supabase
      const { error } = await supabase
        .from('encrypted_medical_data')
        .delete()
        .eq('user_id', this.userId);

      // 2. Очистка из localStorage
      SecureMedicalStorage.clearMedicalData();

      if (!error) {
        toast({
          title: 'Данные удалены',
          description: 'Все медицинские данные безопасно удалены'
        });
        return true;
      }

      console.error('❌ Ошибка удаления из Supabase:', error);
      return false;
    } catch (error) {
      console.error('❌ Ошибка очистки данных:', error);
      return false;
    }
  }

  /**
   * Генерация хэша для проверки целостности данных
   */
  private async generateDataHash(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Валидация аутентификации
   */
  private validateAuth(): boolean {
    if (!this.userId || !this.userPassword) {
      toast({
        title: 'Ошибка аутентификации',
        description: 'Необходимо войти в систему для работы с медицинскими данными',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  }

  /**
   * Очистка чувствительных данных из памяти
   */
  destroy(): void {
    this.userId = null;
    this.userPassword = null;
    console.log('✅ Служба безопасных медицинских данных очищена');
  }

  /**
   * Экспорт медицинских данных для пользователя (GDPR compliance)
   */
  async exportMedicalData(): Promise<Blob | null> {
    if (!this.validateAuth()) return null;

    try {
      const symptoms = await this.getSymptoms();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: this.userId,
        data: {
          symptoms: symptoms || [],
          // Здесь можно добавить другие типы медицинских данных
        },
        metadata: {
          encryption: 'AES-256-GCM',
          compliance: 'GDPR',
          version: '1.0'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      // Логируем экспорт для аудита
      await supabase.rpc('log_medical_data_access', {
        p_user_id: this.userId,
        p_access_type: 'export',
        p_data_type: 'all_medical',
        p_access_result: 'success'
      });

      return blob;
    } catch (error) {
      console.error('❌ Ошибка экспорта медицинских данных:', error);
      return null;
    }
  }
}

// Экспортируем синглтон
export const secureMedicalDataService = SecureMedicalDataService.getInstance();