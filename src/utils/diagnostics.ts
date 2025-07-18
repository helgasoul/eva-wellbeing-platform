// 🔍 DIAGNOSTIC UTILITIES

export const logStorageDump = () => {
  console.log('💾 STORAGE DUMP:', {
    localStorage: Object.fromEntries(Object.entries(localStorage)),
    sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
    timestamp: new Date().toISOString()
  });
};

export const logAllDataSources = () => {
  const allSources = {
    localStorage: {
      eva_user_data: localStorage.getItem('eva_user_data'),
      eva_onboarding_data: localStorage.getItem('eva_onboarding_data'),
      eva_registration_data: localStorage.getItem('eva_registration_data'),
      eva_auth_backup: localStorage.getItem('eva_auth_backup'),
      authErrorCount: localStorage.getItem('authErrorCount'),
      lastAuthError: localStorage.getItem('lastAuthError')
    },
    sessionStorage: {
      eva_onboarding_data: sessionStorage.getItem('eva_onboarding_data'),
      eva_session_data: sessionStorage.getItem('eva_session_data')
    },
    urlParams: new URLSearchParams(window.location.search).toString(),
    currentUrl: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 ALL DATA SOURCES:', allSources);
  return allSources;
};

export const logNetworkState = () => {
  console.log('🌐 NETWORK STATE:', {
    online: navigator.onLine,
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : 'not supported',
    timestamp: new Date().toISOString()
  });
};

export const logPerformanceMetrics = () => {
  if (performance && performance.getEntriesByType) {
    const navigationEntries = performance.getEntriesByType('navigation');
    const resourceEntries = performance.getEntriesByType('resource');
    
    console.log('⚡ PERFORMANCE METRICS:', {
      navigation: navigationEntries,
      resources: resourceEntries.filter(entry => entry.name.includes('supabase')),
      timestamp: new Date().toISOString()
    });
  }
};