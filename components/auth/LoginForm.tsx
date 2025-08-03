import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useAuth } from "../../contexts/AuthContext";
import { HospitalIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon, UserIcon } from "lucide-react";

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const success = await login(email, password);
        if (!success) {
            setError('Invalid email or password');
        }
    };

    const demoAccounts = [
        { email: 'admin@hospice.com', password: 'admin123', role: 'System Admin', hospital: 'Hospice Colony HQ' },
        { email: 'doctor@central.com', password: 'doctor123', role: 'Doctor', hospital: 'Central Medical Center' },
        { email: 'nurse@stmarys.com', password: 'nurse123', role: 'Nurse', hospital: 'St. Mary\'s General Hospital' }
    ];

    const quickLogin = (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <HospitalIcon className="w-7 h-7 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Hospices Colony</h1>
                        <p className="text-muted-foreground">Smart Hospital Bed Allocation System</p>
                    </div>
                </div>

                {/* Login Form */}
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Accounts */}
                <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
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
                                onClick={() => quickLogin(account.email, account.password)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-sm">{account.role}</span>
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

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>© 2025 Hospice Colony. All rights reserved.</p>
                    <p className="mt-1">Secure healthcare management system</p>
                </div>
            </div>
        </div>
    );
}