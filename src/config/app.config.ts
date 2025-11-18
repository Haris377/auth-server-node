import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const appConfig = {
  // App URL configuration
  appUrl: {
    development: process.env.DEV_APP_URL || 'http://localhost:8081',
    production: process.env.PROD_APP_URL || process.env.APP_URL || 'http://103.217.178.30:2000',
  },
  
  // Get the current app URL based on environment
  getCurrentAppUrl(): string {
    return isProduction ? this.appUrl.production : this.appUrl.development;
  },
  
  // Environment
  isProduction,
  isDevelopment: !isProduction,
};

export default appConfig;

