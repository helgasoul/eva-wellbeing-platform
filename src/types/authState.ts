
export interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initializationComplete: boolean;
  retryCount: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  lastFailureTime: number | null;
  jitMigrationInProgress: boolean;
  sessionRecoveryAttempted: boolean;
}

export type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: any | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZATION_COMPLETE'; payload: boolean }
  | { type: 'INCREMENT_RETRY_COUNT' }
  | { type: 'RESET_RETRY_COUNT' }
  | { type: 'SET_CIRCUIT_BREAKER_STATE'; payload: 'closed' | 'open' | 'half-open' }
  | { type: 'SET_LAST_FAILURE_TIME'; payload: number | null }
  | { type: 'SET_JIT_MIGRATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_SESSION_RECOVERY_ATTEMPTED'; payload: boolean }
  | { type: 'RESET_AUTH_STATE' };

export const initialAuthState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  initializationComplete: false,
  retryCount: 0,
  circuitBreakerState: 'closed',
  lastFailureTime: null,
  jitMigrationInProgress: false,
  sessionRecoveryAttempted: false,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        error: action.payload ? null : state.error
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INITIALIZATION_COMPLETE':
      return { ...state, initializationComplete: action.payload };
    case 'INCREMENT_RETRY_COUNT':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY_COUNT':
      return { ...state, retryCount: 0 };
    case 'SET_CIRCUIT_BREAKER_STATE':
      return { ...state, circuitBreakerState: action.payload };
    case 'SET_LAST_FAILURE_TIME':
      return { ...state, lastFailureTime: action.payload };
    case 'SET_JIT_MIGRATION_IN_PROGRESS':
      return { ...state, jitMigrationInProgress: action.payload };
    case 'SET_SESSION_RECOVERY_ATTEMPTED':
      return { ...state, sessionRecoveryAttempted: action.payload };
    case 'RESET_AUTH_STATE':
      return { ...initialAuthState, initializationComplete: true };
    default:
      return state;
  }
};
