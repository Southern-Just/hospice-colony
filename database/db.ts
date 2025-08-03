import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import type { User, NewUser, Session, Hospital } from './schema';

// For production, you would configure this through your build system
const connectionString = 'NEXT_PUBLIC_NEON_DATABASE_URL';

// This would be used in production with a real Neon database
// const sql = neon(connectionString);
// export const db = drizzle(sql, { schema });

// Mock database for demo purposes
export const mockDb = {
    users: [
        {
            id: '1',
            email: 'admin@hospice.com',
            password: 'admin123', // In real app, this would be hashed
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
    ] as User[],
    sessions: [] as Session[],
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
    ] as Hospital[]
};

// Database utility functions
export const dbUtils = {
    // Authentication
    authenticateUser: (email: string, password: string): User | undefined => {
        return mockDb.users.find(
            user => user.email === email && user.password === password && user.isActive
        );
    },

    // User operations
    getUserById: (id: string): User | undefined => {
        return mockDb.users.find(user => user.id === id);
    },

    getUserByEmail: (email: string): User | undefined => {
        return mockDb.users.find(user => user.email === email);
    },

    createUser: (userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): User => {
        const newUser: User = {
            id: `user_${Date.now()}_${Math.random()}`,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockDb.users.push(newUser);
        return newUser;
    },

    // Session operations
    createSession: (userId: string): Session => {
        const session: Session = {
            id: `session_${Date.now()}_${Math.random()}`,
            userId,
            token: `token_${Date.now()}_${Math.random()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdAt: new Date(),
        };
        mockDb.sessions.push(session);
        return session;
    },

    getSessionByToken: (token: string): Session | undefined => {
        return mockDb.sessions.find(session => session.token === token);
    },

    deleteSession: (token: string): boolean => {
        const index = mockDb.sessions.findIndex(session => session.token === token);
        if (index > -1) {
            mockDb.sessions.splice(index, 1);
            return true;
        }
        return false;
    },

    // Hospital operations
    getHospitalById: (id: string): Hospital | undefined => {
        return mockDb.hospitals.find(hospital => hospital.id === id);
    },

    getAllHospitals: (): Hospital[] => {
        return mockDb.hospitals.filter(hospital => hospital.isActive);
    }
};

// Export placeholder db object for future real database integration
export const db = {
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