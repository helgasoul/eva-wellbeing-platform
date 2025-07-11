/**
 * Health Data Validation Utilities
 * 
 * This module provides validation functions for health data types and values
 * across all supported providers (Apple Health, Fitbit, Garmin, Whoop, Oura).
 */

import { SUPPORTED_DATA_TYPES, PROVIDER_DATA_TYPES, validateDataType } from '@/components/health/HealthDataDashboard';

export interface HealthDataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates health data payload structure and values
 */
export const validateHealthDataPayload = (
  dataType: string,
  payload: any,
  provider?: string
): HealthDataValidationResult => {
  const result: HealthDataValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if data type is supported
  if (!validateDataType(dataType)) {
    result.isValid = false;
    result.errors.push(`Unsupported data type: ${dataType}`);
    return result;
  }

  // Check if provider supports this data type
  if (provider && PROVIDER_DATA_TYPES[provider as keyof typeof PROVIDER_DATA_TYPES]) {
    const supportedTypes = PROVIDER_DATA_TYPES[provider as keyof typeof PROVIDER_DATA_TYPES] as readonly string[];
    if (!supportedTypes.includes(dataType)) {
      result.warnings.push(`Data type '${dataType}' is not typically supported by ${provider}`);
    }
  }

  // Validate payload structure based on data type
  switch (dataType) {
    case 'heart_rate':
      if (typeof payload !== 'number' && typeof payload !== 'object') {
        result.errors.push('Heart rate data must be a number or object with heart rate values');
        result.isValid = false;
      } else if (typeof payload === 'number' && (payload < 30 || payload > 220)) {
        result.warnings.push('Heart rate value seems unusual (normal range: 30-220 bpm)');
      }
      break;

    case 'steps':
      if (typeof payload !== 'number') {
        result.errors.push('Steps data must be a number');
        result.isValid = false;
      } else if (payload < 0 || payload > 100000) {
        result.warnings.push('Steps value seems unusual (expected range: 0-100,000)');
      }
      break;

    case 'temperature':
      const tempValue = typeof payload === 'object' ? payload.body_temperature : payload;
      if (typeof tempValue !== 'number') {
        result.errors.push('Temperature data must be a number');
        result.isValid = false;
      } else if (tempValue < 30 || tempValue > 45) {
        result.warnings.push('Temperature value seems unusual (normal range: 30-45°C)');
      }
      break;

    case 'readiness':
    case 'recovery':
    case 'strain':
      if (typeof payload !== 'number') {
        result.errors.push(`${dataType} data must be a number`);
        result.isValid = false;
      } else if (payload < 0 || payload > 100) {
        result.warnings.push(`${dataType} value should typically be between 0-100`);
      }
      break;

    case 'weight':
      if (typeof payload !== 'number') {
        result.errors.push('Weight data must be a number');
        result.isValid = false;
      } else if (payload < 20 || payload > 300) {
        result.warnings.push('Weight value seems unusual (expected range: 20-300 kg)');
      }
      break;

    case 'bmi':
      if (typeof payload !== 'number') {
        result.errors.push('BMI data must be a number');
        result.isValid = false;
      } else if (payload < 10 || payload > 50) {
        result.warnings.push('BMI value seems unusual (expected range: 10-50)');
      }
      break;

    case 'body_fat':
    case 'body_water':
    case 'protein':
      if (typeof payload !== 'number') {
        result.errors.push(`${dataType} data must be a number`);
        result.isValid = false;
      } else if (payload < 0 || payload > 100) {
        result.warnings.push(`${dataType} value should be a percentage between 0-100`);
      }
      break;

    case 'muscle_mass':
    case 'bone_mass':
      if (typeof payload !== 'number') {
        result.errors.push(`${dataType} data must be a number`);
        result.isValid = false;
      } else if (payload < 1 || payload > 100) {
        result.warnings.push(`${dataType} value seems unusual (expected range: 1-100 kg)`);
      }
      break;

    case 'visceral_fat':
      if (typeof payload !== 'number') {
        result.errors.push('Visceral fat data must be a number');
        result.isValid = false;
      } else if (payload < 1 || payload > 30) {
        result.warnings.push('Visceral fat value seems unusual (expected range: 1-30)');
      }
      break;

    case 'bmr':
      if (typeof payload !== 'number') {
        result.errors.push('BMR data must be a number');
        result.isValid = false;
      } else if (payload < 800 || payload > 4000) {
        result.warnings.push('BMR value seems unusual (expected range: 800-4000 kcal)');
      }
      break;

    case 'sleep':
      if (typeof payload === 'object') {
        if (!payload.duration && !payload.total) {
          result.errors.push('Sleep data must include duration or total sleep time');
          result.isValid = false;
        }
      } else if (typeof payload !== 'number') {
        result.errors.push('Sleep data must be a number (minutes) or object with sleep details');
        result.isValid = false;
      }
      break;

    case 'calories':
      if (typeof payload !== 'number') {
        result.errors.push('Calories data must be a number');
        result.isValid = false;
      } else if (payload < 0 || payload > 10000) {
        result.warnings.push('Calories value seems unusual (expected range: 0-10,000)');
      }
      break;

    case 'workouts':
      if (typeof payload === 'object') {
        if (!payload.duration && !payload.count && !payload.type) {
          result.warnings.push('Workout data should include duration, count, or type information');
        }
      }
      break;

    case 'nutrition':
      if (typeof payload === 'object') {
        if (!payload.entries && !payload.calories && !payload.nutrients) {
          result.warnings.push('Nutrition data should include entries, calories, or nutrient information');
        }
      }
      break;
  }

  return result;
};

/**
 * Validates a complete health data record
 */
export const validateHealthDataRecord = (record: {
  data_type: string;
  data_payload: any;
  recorded_date: string;
  data_source?: string;
  user_id: string;
}): HealthDataValidationResult => {
  const result: HealthDataValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate required fields
  if (!record.data_type) {
    result.errors.push('data_type is required');
    result.isValid = false;
  }

  if (!record.data_payload) {
    result.errors.push('data_payload is required');
    result.isValid = false;
  }

  if (!record.recorded_date) {
    result.errors.push('recorded_date is required');
    result.isValid = false;
  }

  if (!record.user_id) {
    result.errors.push('user_id is required');
    result.isValid = false;
  }

  // Validate date format
  if (record.recorded_date && isNaN(Date.parse(record.recorded_date))) {
    result.errors.push('recorded_date must be a valid date');
    result.isValid = false;
  }

  // Validate payload if basic validation passes
  if (result.isValid && record.data_type && record.data_payload) {
    const payloadValidation = validateHealthDataPayload(
      record.data_type,
      record.data_payload,
      record.data_source
    );
    
    result.errors.push(...payloadValidation.errors);
    result.warnings.push(...payloadValidation.warnings);
    result.isValid = result.isValid && payloadValidation.isValid;
  }

  return result;
};

/**
 * Get all supported data types
 */
export const getSupportedDataTypes = (): string[] => {
  return SUPPORTED_DATA_TYPES;
};

/**
 * Get supported data types for a specific provider
 */
export const getProviderDataTypes = (provider: string): string[] => {
  const providerTypes = PROVIDER_DATA_TYPES[provider as keyof typeof PROVIDER_DATA_TYPES];
  return providerTypes ? [...providerTypes] : [];
};

/**
 * Check if a provider is supported
 */
export const isProviderSupported = (provider: string): boolean => {
  return provider in PROVIDER_DATA_TYPES;
};