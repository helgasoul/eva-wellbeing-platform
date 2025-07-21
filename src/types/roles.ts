
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  EXPERT = 'expert',
}

export const ROLE_LABELS = {
  [UserRole.PATIENT]: 'Пациент',
  [UserRole.DOCTOR]: 'Врач',
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.EXPERT]: 'Эксперт',
};

export const ROLE_DESCRIPTIONS = {
  [UserRole.PATIENT]: 'Получайте персональные рекомендации и отслеживайте своё здоровье',
  [UserRole.DOCTOR]: 'Консультируйте пациентов и управляйте медицинскими данными',
  [UserRole.ADMIN]: 'Администрирование системы',
  [UserRole.EXPERT]: 'Делитесь опытом и создавайте контент',
};

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.PATIENT:
      return '/patient/dashboard';
    case UserRole.DOCTOR:
      return '/doctor/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.EXPERT:
      return '/expert/blog';
    default:
      return '/patient/dashboard';
  }
};
