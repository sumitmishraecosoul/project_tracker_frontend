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
    // Check if we're in production (Vercel or Azure)
    if (process.env.NODE_ENV === 'production') {
      return config.api.production;
    }
    
    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      return config.api.development;
    }
    
    // Fallback to production for Vercel preview deployments
    return config.api.production;
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
