import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../database/schema';
import { dbUtils } from '../database/db';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on app load
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const userData = localStorage.getItem('userData');

                if (token && userData) {
                    const parsedUser = JSON.parse(userData);

                    // Verify the session is still valid
                    const session = dbUtils.getSessionByToken(token);
                    if (session && session.expiresAt > new Date()) {
                        setUser(parsedUser);
                    } else {
                        // Session expired, clean up
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Authenticate user using database utilities
            const foundUser = dbUtils.authenticateUser(email, password);

            if (foundUser) {
                // Create a session
                const session = dbUtils.createSession(foundUser.id);

                // Store token and user data
                localStorage.setItem('authToken', session.token);
                localStorage.setItem('userData', JSON.stringify(foundUser));

                setUser(foundUser);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Remove session from database
            dbUtils.deleteSession(token);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}