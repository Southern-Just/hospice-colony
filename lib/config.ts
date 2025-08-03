// Configuration for the Hospice Colony application
export const config = {
    // Database configuration
    database: {
        // For production, these would come from environment variables
        url: 'YOUR_NEON_DATABASE_URL_HERE',
        ssl: true,
    },

    // Authentication configuration
    auth: {
        // Session duration in milliseconds (24 hours)
        sessionDuration: 24 * 60 * 60 * 1000,

        // JWT secret (for production)
        jwtSecret: 'YOUR_JWT_SECRET_HERE',

        // Password requirements
        passwordMinLength: 8,
    },

    // Application settings
    app: {
        name: 'Hospice Colony',
        version: '2.1.0',
        description: 'Smart Hospital Bed Allocation System',
    },

    // Development settings
    dev: {
        useMockData: true,
        enableLogging: true,
    }
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
    return config.dev.useMockData;
};

// Helper function to get database URL
export const getDatabaseUrl = () => {
    if (isDevelopment()) {
        return 'mock://localhost';
    }
    return config.database.url;
};