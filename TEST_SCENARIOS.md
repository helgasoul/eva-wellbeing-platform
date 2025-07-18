# Тестовые сценарии для проверки багов и конфликтов

## 🧪 UNIT ТЕСТЫ

### 1. Тест потери данных в RegistrationComplete
```typescript
// __tests__/RegistrationComplete.test.tsx
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { RegistrationComplete } from '../components/auth/registration/RegistrationComplete';

describe('RegistrationComplete Data Flow', () => {
  it('КРИТИЧЕСКИЙ БАГ: должен сохранить данные ПЕРЕД сбросом', async () => {
    const mockNavigate = jest.fn();
    const mockResetRegistration = jest.fn();
    const mockUpdateUser = jest.fn();
    
    const registrationData = {
      firstName: 'Тест',
      lastName: 'Пользователь',
      email: 'test@example.com',
      selectedPersona: 'active_phase'
    };

    render(
      <RegistrationComplete
        registrationData={registrationData}
        resetRegistration={mockResetRegistration}
        updateUser={mockUpdateUser}
        navigate={mockNavigate}
      />
    );

    const completeButton = screen.getByText('Завершить регистрацию');
    fireEvent.click(completeButton);

    await waitFor(() => {
      // ПРОВЕРКА: данные должны быть сохранены ПЕРЕД сбросом
      expect(mockUpdateUser).toHaveBeenCalledWith({
        onboardingPresets: expect.objectContaining({
          basicInfo: {
            firstName: 'Тест',
            lastName: 'Пользователь',
            email: 'test@example.com'
          },
          persona: 'active_phase'
        })
      });
      
      // ПРОВЕРКА: localStorage должен содержать данные
      const storedData = localStorage.getItem('onboarding-presets');
      expect(storedData).toBeTruthy();
      
      // ПРОВЕРКА: сброс должен происходить ПОСЛЕ сохранения
      expect(mockResetRegistration).toHaveBeenCalledAfter(mockUpdateUser);
    });
  });
});
```

### 2. Тест восстановления данных в PatientOnboarding
```typescript
// __tests__/PatientOnboarding.test.tsx
describe('PatientOnboarding Data Recovery', () => {
  it('должен восстановить данные после прерывания', async () => {
    // Симулируем прерванный онбординг
    const presetData = {
      basicInfo: { firstName: 'Тест', lastName: 'Пользователь' },
      persona: 'active_phase',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('onboarding-presets', JSON.stringify(presetData));
    
    const { getByDisplayValue, getByText } = render(
      <PatientOnboarding />
    );

    await waitFor(() => {
      // ПРОВЕРКА: данные должны быть восстановлены
      expect(getByDisplayValue('Тест')).toBeInTheDocument();
      expect(getByDisplayValue('Пользователь')).toBeInTheDocument();
    });
  });
});
```

### 3. Тест персонализации вопросов
```typescript
describe('Personalization Logic', () => {
  it.each([
    ['planning_ahead', 'Когда планируете начать подготовку?'],
    ['active_phase', 'Какие симптомы беспокоят вас сейчас?'],
    ['seeking_support', 'Нужна ли вам эмоциональная поддержка?']
  ])('должен показать правильные вопросы для персоны %s', (persona, expectedQuestion) => {
    const user = { selectedPersona: persona };
    
    render(<PatientOnboarding user={user} />);
    
    expect(screen.getByText(expectedQuestion)).toBeInTheDocument();
  });
});
```

## 🔄 ИНТЕГРАЦИОННЫЕ ТЕСТЫ

### 1. Полный поток регистрации → онбординг
```typescript
describe('Full Registration to Onboarding Flow', () => {
  it('должен передать данные через весь поток', async () => {
    // Шаг 1: Регистрация
    const { getByText, getByLabelText } = render(<RegistrationFlow />);
    
    fireEvent.change(getByLabelText('Имя'), { target: { value: 'Анна' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'anna@test.com' } });
    fireEvent.click(getByText('Активная фаза'));
    fireEvent.click(getByText('Завершить регистрацию'));

    // Шаг 2: Проверка перехода к онбордингу
    await waitFor(() => {
      expect(window.location.pathname).toBe('/patient/onboarding');
    });

    // Шаг 3: Проверка данных в онбординге
    await waitFor(() => {
      expect(screen.getByDisplayValue('Анна')).toBeInTheDocument();
      expect(screen.getByText('персонализированные вопросы для активной фазы')).toBeInTheDocument();
    });
  });
});
```

### 2. Тест OnboardingGuard
```typescript
describe('OnboardingGuard Protection', () => {
  it('должен редиректить на онбординг если не завершен', async () => {
    const user = { role: 'patient', onboardingCompleted: false };
    
    render(
      <MemoryRouter initialEntries={['/patient/dashboard']}>
        <OnboardingGuard user={user}>
          <div>Dashboard Content</div>
        </OnboardingGuard>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/patient/onboarding');
    });
  });
});
```

## 🚨 EDGE CASES И БАГИ

### 1. Тест недоступности localStorage
```typescript
describe('localStorage Unavailability', () => {
  it('должен работать без localStorage', async () => {
    // Симулируем недоступность localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('localStorage недоступен');
    });

    const { getByText } = render(<RegistrationComplete />);
    
    // Должен работать без ошибок
    fireEvent.click(getByText('Завершить регистрацию'));
    
    await waitFor(() => {
      // Данные должны быть только в AuthContext
      expect(mockUpdateUser).toHaveBeenCalled();
    });

    localStorage.setItem = originalSetItem;
  });
});
```

### 2. Тест race conditions
```typescript
describe('Race Conditions', () => {
  it('должен корректно обработать быстрые переходы', async () => {
    const { getByText } = render(<RegistrationComplete />);
    
    // Быстрые множественные клики
    const button = getByText('Завершить регистрацию');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      // Данные должны быть сохранены только один раз
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 3. Тест утечек памяти
```typescript
describe('Memory Leaks', () => {
  it('должен очищать таймеры при unmount', () => {
    const { unmount } = render(<PatientOnboarding />);
    
    // Симулируем unmount
    unmount();
    
    // Проверяем что таймеры очищены
    expect(clearTimeout).toHaveBeenCalled();
  });
});
```

## 📊 PERFORMANCE ТЕСТЫ

### 1. Тест ре-рендеров
```typescript
describe('Performance Optimizations', () => {
  it('должен минимизировать re-renders', async () => {
    const renderSpy = jest.fn();
    
    const TestComponent = () => {
      renderSpy();
      return <PatientOnboarding />;
    };

    const { rerender } = render(<TestComponent />);
    
    // Изменяем props
    rerender(<TestComponent />);
    
    // Должен быть только один дополнительный рендер
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
```

### 2. Тест размера bundle
```typescript
describe('Bundle Size', () => {
  it('не должен увеличивать bundle критично', () => {
    const bundleSize = getBundleSize();
    expect(bundleSize).toBeLessThan(MAX_BUNDLE_SIZE);
  });
});
```

## 🔒 БЕЗОПАСНОСТЬ ТЕСТЫ

### 1. Тест валидации данных
```typescript
describe('Data Validation', () => {
  it('должен валидировать входные данные', () => {
    const maliciousData = {
      firstName: '<script>alert("XSS")</script>',
      email: 'invalid-email'
    };

    expect(() => {
      validateOnboardingData(maliciousData);
    }).toThrow('Некорректные данные');
  });
});
```

### 2. Тест чувствительных данных
```typescript
describe('Sensitive Data Protection', () => {
  it('должен защищать медицинские данные', () => {
    const sensitiveData = {
      symptoms: ['приливы', 'депрессия'],
      medications: ['эстроген']
    };

    const stored = localStorage.getItem('medical-data');
    
    // Данные должны быть зашифрованы
    expect(stored).not.toContain('приливы');
    expect(stored).not.toContain('депрессия');
  });
});
```

## 🎯 BROWSER COMPATIBILITY ТЕСТЫ

### 1. Тест старых браузеров
```typescript
describe('Browser Compatibility', () => {
  it('должен работать в IE11', () => {
    // Симулируем IE11
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko' }
    });

    const { getByText } = render(<PatientOnboarding />);
    
    expect(getByText('Начать онбординг')).toBeInTheDocument();
  });
});
```

### 2. Тест мобильных устройств
```typescript
describe('Mobile Compatibility', () => {
  it('должен работать на мобильных устройствах', () => {
    // Симулируем мобильное устройство
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });

    const { container } = render(<PatientOnboarding />);
    
    expect(container.firstChild).toHaveClass('mobile-responsive');
  });
});
```

## 📋 ACCESSIBILITY ТЕСТЫ

### 1. Тест скринридеров
```typescript
describe('Accessibility', () => {
  it('должен быть доступен для скринридеров', async () => {
    const { container } = render(<PatientOnboarding />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 🎉 РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ

После выполнения всех тестов должны быть исправлены:
- ✅ Критический баг с потерей данных
- ✅ Проблемы с типизацией
- ✅ Race conditions
- ✅ Утечки памяти
- ✅ Проблемы безопасности
- ✅ Проблемы производительности
- ✅ Совместимость браузеров
- ✅ Accessibility проблемы

**Статус тестирования:** 🔴 **FAILED** - требуются исправления перед merge.