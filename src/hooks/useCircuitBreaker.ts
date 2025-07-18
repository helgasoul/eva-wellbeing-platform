
import { useCallback } from 'react';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

export const useCircuitBreaker = (
  state: 'closed' | 'open' | 'half-open',
  retryCount: number,
  lastFailureTime: number | null,
  setState: (state: 'closed' | 'open' | 'half-open') => void,
  setLastFailureTime: (time: number | null) => void,
  config: CircuitBreakerConfig = {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    halfOpenMaxCalls: 1
  }
) => {
  const canExecute = useCallback(() => {
    const now = Date.now();
    
    switch (state) {
      case 'closed':
        return true;
      case 'open':
        if (lastFailureTime && now - lastFailureTime >= config.resetTimeout) {
          setState('half-open');
          return true;
        }
        return false;
      case 'half-open':
        return retryCount < config.halfOpenMaxCalls;
      default:
        return false;
    }
  }, [state, retryCount, lastFailureTime, setState, config]);

  const onSuccess = useCallback(() => {
    setState('closed');
    setLastFailureTime(null);
  }, [setState, setLastFailureTime]);

  const onFailure = useCallback(() => {
    const now = Date.now();
    setLastFailureTime(now);
    
    if (state === 'half-open') {
      setState('open');
    } else if (retryCount >= config.failureThreshold) {
      setState('open');
    }
  }, [state, retryCount, setState, setLastFailureTime, config]);

  return {
    canExecute,
    onSuccess,
    onFailure,
    isOpen: state === 'open'
  };
};
