// Исправления для решения проблем с потоком данных в онбординге

// ПРОБЛЕМА: Данные теряются при завершении регистрации
// РЕШЕНИЕ: Сохранять данные ПЕРЕД сбросом

// 1. Исправить src/components/auth/registration/RegistrationComplete.tsx
const handleComplete = () => {
  // Сохранить данные ПЕРЕД сбросом
  const bridgeData = {
    basicInfo: {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email
    },
    persona: selectedPersona,
    preferences: {
      agreeToTerms: registrationData.agreeToTerms,
      agreeToPrivacy: registrationData.agreeToPrivacy
    },
    timestamp: new Date().toISOString()
  };
  
  // Сохранить в AuthContext
  updateUser({ 
    onboardingPresets: bridgeData,
    selectedPersona: selectedPersona
  });
  
  // Backup в localStorage
  localStorage.setItem('onboarding-presets', JSON.stringify(bridgeData));
  
  // Теперь можно сбрасывать
  resetRegistration();
  
  // Переход с состоянием
  navigate('/patient/onboarding', { 
    state: { fromRegistration: true } 
  });
};

// 2. Обновить src/contexts/AuthContext.tsx
interface OnboardingPresets {
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  persona: PersonaType;
  preferences: {
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
  };
  timestamp: string;
}

interface User {
  // ... существующие поля
  selectedPersona?: PersonaType;
  onboardingPresets?: OnboardingPresets;
}

// 3. Создать src/services/dataBridge.ts
export class DataBridge {
  private static instance: DataBridge;
  
  public static getInstance(): DataBridge {
    if (!DataBridge.instance) {
      DataBridge.instance = new DataBridge();
    }
    return DataBridge.instance;
  }

  transferData(data: any): void {
    const bridgeData = {
      ...data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('onboarding-presets', JSON.stringify(bridgeData));
  }

  loadPresets(): any {
    const presets = localStorage.getItem('onboarding-presets');
    return presets ? JSON.parse(presets) : null;
  }

  validateIntegrity(): boolean {
    const presets = localStorage.getItem('onboarding-presets');
    const user = localStorage.getItem('user');
    return !!(presets || user);
  }

  cleanup(): void {
    localStorage.removeItem('onboarding-presets');
    localStorage.removeItem('onboarding-progress');
  }
}

export const dataBridge = DataBridge.getInstance();

// 4. Обновить src/pages/patient/PatientOnboarding.tsx
const PatientOnboarding = () => {
  const { user, updateOnboardingData } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Загрузка данных из разных источников
    const presets = dataBridge.loadPresets();
    const authData = user?.onboardingData;
    const fromRegistration = location.state?.fromRegistration;
  }, [user, location.state?.fromRegistration]);

    const initialData = {
      // Данные из регистрации
      ...(presets?.basicInfo && {
        firstName: presets.basicInfo.firstName,
        lastName: presets.basicInfo.lastName
      }),
      
      // Данные из AuthContext
      ...authData,
      
      // Персона
      ...(presets?.persona && {
        selectedPersona: presets.persona
      })
    };

    setFormData(initialData);
    
    if (fromRegistration) {
      console.log('Данные загружены из регистрации:', initialData);
    }
  }, [user, location.state]);

  // Персонализация на основе персоны
  const personalizedQuestions = useMemo(() => {
    const persona = formData.selectedPersona || user?.selectedPersona;
    
    switch (persona) {
      case 'planning_ahead':
        return getPlanningAheadQuestions(currentStep);
      case 'active_phase':
        return getActivePhaseQuestions(currentStep);
      case 'seeking_support':
        return getSeekingSupportQuestions(currentStep);
      default:
        return getDefaultQuestions(currentStep);
    }
  }, [currentStep, formData.selectedPersona, user?.selectedPersona]);

  // Остальная логика...
};

// 5. Создать src/components/onboarding/OnboardingGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingGuard = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role === 'patient' && !user.onboardingCompleted) {
    return <Navigate to="/patient/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default OnboardingGuard;