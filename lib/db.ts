import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// For now, we'll use a placeholder and rely on mock data
const connectionString = 'NEXT_PUBLIC_NEON_DATABASE_URL';

// This would be used in production with a real Neon database
// const sql = neon(connectionString);
// export const db = drizzle(sql, { schema });

// Mock database operations for demo purposes
export const mockDb = {
    users: [
        {
            id: '1',
            email: 'admin@hospice.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            hospitalId: '1',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            email: 'doctor@central.com',
            password: 'doctor123',
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            role: 'doctor',
            hospitalId: '1',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '3',
            email: 'nurse@stmarys.com',
            password: 'nurse123',
            firstName: 'Emily',
            lastName: 'Davis',
            role: 'nurse',
            hospitalId: '2',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ],
    sessions: [],
    hospitals: [
        {
            id: '1',
            name: 'Central Medical Center',
            location: 'Downtown District',
            totalBeds: '150',
            phone: '+1 (555) 123-4567',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            name: 'St. Mary\'s General Hospital',
            location: 'West Side',
            totalBeds: '200',
            phone: '+1 (555) 234-5678',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ]
};

export const dbUtils = {
    authenticateUser: (email: string, password: string) => {
        return mockDb.users.find(
            user => user.email === email && user.password === password && user.isActive
        );
    },

    // Find user by ID
    getUserById: (id: string) => {
        return mockDb.users.find(user => user.id === id);
    },

    // Create a new session
    createSession: (userId: string) => {
        const session = {
            id: `session_${Date.now()}_${Math.random()}`,
            userId,
            token: `token_${Date.now()}_${Math.random()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdAt: new Date(),
        };
        mockDb.sessions.push(session);
        return session;
    },

    // Find session by token
    getSessionByToken: (token: string) => {
        return mockDb.sessions.find(session => session.token === token);
    },

    // Delete session
    deleteSession: (token: string) => {
        const index = mockDb.sessions.findIndex(session => session.token === token);
        if (index > -1) {
            mockDb.sessions.splice(index, 1);
            return true;
        }
        return false;
    },

    // Get hospital by ID
    getHospitalById: (id: string) => {
        return mockDb.hospitals.find(hospital => hospital.id === id);
    },

    // Get all hospitals
    getAllHospitals: () => {
        return mockDb.hospitals.filter(hospital => hospital.isActive);
    }
};

// Export a placeholder db object for future real database integration
export const db = {
    // Placeholder for real database queries
    query: {
        users: {
            findFirst: () => Promise.resolve(null),
            findMany: () => Promise.resolve([]),
        },
        sessions: {
            findFirst: () => Promise.resolve(null),
            create: () => Promise.resolve(null),
        },
        hospitals: {
            findMany: () => Promise.resolve([]),
        }
    }
};