// Mock form validation without Zod dependency
export const validateForm = (data: any, fields: string[]): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'This field is required';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Mock resolver for react-hook-form
export const mockResolver = (schema: any) => {
  return async (data: any) => {
    // Simple validation - just return the data
    return {
      values: data,
      errors: {}
    };
  };
};