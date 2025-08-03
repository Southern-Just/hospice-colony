'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, HospitalIcon, CheckCircleIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { dbUtils } from "../database/db";

export interface AuthFormProps {
    type: 'sign-in' | 'sign-up';
}

interface FormData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    confirmPassword?: string;
}

const demoAccounts = [
    {
        email: 'admin@hospice.com',
        password: 'admin123',
        role: 'System Admin',
        hospital: 'Hospice Colony HQ'
    },
    {
        email: 'doctor@central.com',
        password: 'doctor123',
        role: 'Doctor',
        hospital: 'Central Medical Center'
    },
    {
        email: 'nurse@stmarys.com',
        password: 'nurse123',
        role: 'Nurse',
        hospital: 'St. Mary\'s General Hospital'
    }
];

export default function AuthForm({ type }: AuthFormProps) {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const { login } = useAuth();
    const isSignUp = type === 'sign-up';

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Sign-up specific validations
        if (isSignUp) {
            if (!formData.firstName?.trim()) {
                errors.firstName = 'First name is required';
            }
            if (!formData.lastName?.trim()) {
                errors.lastName = 'Last name is required';
            }
            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (isSignUp) {
                // Handle sign-up
                const existingUser = dbUtils.getUserByEmail(formData.email);
                if (existingUser) {
                    setError('An account with this email already exists');
                    return;
                }

                const newUser = dbUtils.createUser({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName!,
                    lastName: formData.lastName!,
                    role: 'staff',
                    hospitalId: null,
                    isActive: true,
                });

                if (newUser) {
                    setSignUpSuccess(true);
                } else {
                    setError('Failed to create account. Please try again.');
                }
            } else {
                // Handle sign-in
                const success = await login(formData.email, formData.password);
                if (!success) {
                    setError('Invalid email or password. Please try again.');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoSelect = (email: string, password: string) => {
        setFormData(prev => ({ ...prev, email, password }));
        setError('');
    };

    const resetSignUp = () => {
        setSignUpSuccess(false);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            confirmPassword: '',
        });
    };

    // Success screen for sign-up
    if (isSignUp && signUpSuccess) {
        return (
            <div className="min-h-screen hospital-auth-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                                <HospitalIcon className="w-7 h-7 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1>Hospice Colony</h1>
                            <p className="text-muted-foreground">Smart Hospital Bed Allocation System</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            v2.1.0 - Swarm Algorithm
                        </Badge>
                    </div>

                    {/* Success Content */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2>Account Created Successfully!</h2>
                            <p className="text-muted-foreground">
                                Your account has been created. You can now sign in to access the system.
                            </p>
                        </div>

                        <Alert className="text-left">
                            <AlertDescription>
                                Your account will need to be activated by an administrator before you can access all features.
                                Please contact your system administrator for account activation.
                            </AlertDescription>
                        </Alert>

                        <Button onClick={resetSignUp} className="w-full">
                            Continue to Sign In
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                        <p>© 2025 Hospice Colony. All rights reserved.</p>
                        <p>Secure healthcare management system</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen hospital-auth-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <HospitalIcon className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <h1>Hospice Colony</h1>
                        <p className="text-muted-foreground">Smart Hospital Bed Allocation System</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        v2.1.0 - Swarm Algorithm
                    </Badge>
                </div>

                {/* Main Form */}
                <Card className="w-full shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle>
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </CardTitle>
                        <CardDescription>
                            {isSignUp
                                ? 'Enter your details to create your account'
                                : 'Enter your credentials to access the system'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Sign-up fields */}
                            {isSignUp && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                type="text"
                                                placeholder="First name"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="pl-10"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.firstName && (
                                            <p className="text-sm text-destructive">{validationErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="lastName"
                                                type="text"
                                                placeholder="Last name"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="pl-10"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.lastName && (
                                            <p className="text-sm text-destructive">{validationErrors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Email field */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="text-sm text-destructive">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="pl-10 pr-10"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                {validationErrors.password && (
                                    <p className="text-sm text-destructive">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm password field for sign-up */}
                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            className="pl-10 pr-10"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    {validationErrors.confirmPassword && (
                                        <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                                    )}
                                </div>
                            )}

                            {/* Error display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Submit button */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading
                                    ? (isSignUp ? 'Creating Account...' : 'Signing in...')
                                    : (isSignUp ? 'Create Account' : 'Sign In')
                                }
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Accounts (only for sign-in) */}
                {!isSignUp && (
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2">
                                <UserIcon className="w-5 h-5" />
                                <span>Demo Accounts</span>
                            </CardTitle>
                            <CardDescription>
                                Click any account below to auto-fill login credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {demoAccounts.map((account, index) => (
                                <div
                                    key={index}
                                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleDemoSelect(account.email, account.password)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm">{account.role}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {account.role === 'System Admin' ? 'Admin' : account.role}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{account.hospital}</p>
                                            <p className="text-xs text-muted-foreground">{account.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Terms and Privacy (only for sign-up) */}
                {isSignUp && (
                    <div className="text-center text-xs text-muted-foreground space-y-2">
                        <p>
                            By creating an account, you agree to our{' '}
                            <Button variant="link" className="p-0 h-auto text-xs underline">
                                Terms of Service
                            </Button>{' '}
                            and{' '}
                            <Button variant="link" className="p-0 h-auto text-xs underline">
                                Privacy Policy
                            </Button>
                        </p>
                        <p>
                            This system is intended for authorized healthcare professionals only.
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => {
                                // In a real app, this would use routing
                                console.log(`Navigate to ${isSignUp ? 'sign-in' : 'sign-up'}`);
                            }}
                        >
                            {isSignUp ? 'Sign in here' : 'Sign up here'}
                        </Button>
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground space-y-1">
                    <p>© 2025 Hospice Colony. All rights reserved.</p>
                    <p>Secure healthcare management system</p>
                </div>
            </div>
        </div>
    );
}