import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon } from "lucide-react";

export interface AuthFormData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    confirmPassword?: string;
}

export interface AuthFormProps {
    type: 'sign-in' | 'sign-up';
    onSubmit: (data: AuthFormData) => Promise<void>;
    isLoading?: boolean;
    error?: string;
}

export function AuthForm({ type, onSubmit, isLoading = false, error }: AuthFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    const handleInputChange = (field: keyof AuthFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit(formData);
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl">
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
                        <>
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
                        </>
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
    );
}