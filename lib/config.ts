export const config = {
  database: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
  auth: {
    sessionDuration: 24 * 60 * 60 * 1000,
    jwtSecret: process.env.NEXT_PUBLIC_JWT_SECRET!,
    passwordMinLength: 8,
  },
  app: {
    name: "Hospice Colony",
    version: "sajoh-1.0.0",
    description: "Smart Hospital Bed Allocation System",
  },
  dev: {
    useMockData: false,
    enableLogging: true,
  },
};

export const isDevelopment = () => process.env.NODE_ENV === "development";
export const getDatabaseUrl = () => config.database.url;
