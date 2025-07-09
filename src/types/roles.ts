
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  EXPERT = 'expert',
  ADMIN = 'admin'
}

export const ROLE_LABELS = {
  [UserRole.PATIENT]: 'Пациентка',
  [UserRole.DOCTOR]: 'Врач',
  [UserRole.EXPERT]: 'Эксперт',
  [UserRole.ADMIN]: 'Администратор'
};

export const ROLE_DESCRIPTIONS = {
  [UserRole.PATIENT]: 'Я хочу получать поддержку и консультации',
  [UserRole.DOCTOR]: 'Я хочу консультировать пациенток',
  [UserRole.EXPERT]: 'Я хочу делиться экспертными знаниями',
  [UserRole.ADMIN]: 'Управление платформой'
};

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.PATIENT:
      return '/patient/dashboard';
    case UserRole.DOCTOR:
      return '/doctor/dashboard';
    case UserRole.EXPERT:
      return '/expert/blog';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
};
