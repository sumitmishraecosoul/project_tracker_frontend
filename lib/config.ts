// Environment configuration
export const config = {
  // API Configuration
  api: {
    // Development backend URL
    development: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    // Production backend URL
    production: 'https://project-tracker-backend-xi.vercel.app',
  },
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
//   isStaging: process.env.NODE_ENV === 'staging',
  
  // Get current API URL based on environment
  getApiUrl: () => {
    let apiUrl: string;
    
    // Check if we're in production (Vercel or Azure)
    if (process.env.NODE_ENV === 'production') {
      apiUrl = config.api.production;
    }
    // Check if we're in development - use localhost since backend is running
    else if (process.env.NODE_ENV === 'development') {
      apiUrl = config.api.development;
    }
    // Check if we're on Vercel (even in preview mode)
    else if (process.env.VERCEL) {
      apiUrl = config.api.production;
    }
    // Fallback to production for Vercel preview deployments
    else {
      apiUrl = config.api.production;
    }
    
    // Debug logging
    console.log('🔧 API Configuration Debug:');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  VERCEL:', process.env.VERCEL);
    console.log('  Selected API URL:', apiUrl);
    
    return apiUrl;
  },
  
  // App configuration
  app: {
    name: 'Project Tracker',
    version: process.env.npm_package_version || '1.0.0',
  },
  
  // Feature flags
  features: {
    enableDebugLogging: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NODE_ENV === 'production',
  },
};
