'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, HospitalIcon } from 'lucide-react';

type Mode = 'sign-in' | 'sign-up';

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const toggleMode = () => {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'sign-in') {
        const success = await login(formData.email, formData.password);
        if (success) {
          router.push('/');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Sign-up
        const res = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Sign-up failed');
          return;
        }

        // Attempt login after successful sign-up
        const loginSuccess = await login(formData.email, formData.password);
        if (loginSuccess) {
          router.push('/');
        } else {
          setError('Sign-up succeeded but login failed');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-partner-hospitals flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <HospitalIcon className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hospice::Colony</h1>
            <p className="text-muted-foreground">Authentication Portal</p>
          </div>
          <Badge variant="outline" className="text-xs">
            sajoh - Swarm Algorithm 001
          </Badge>
        </div>

        {/* Main Form */}
        <Card className="w-full bg-partner-hospitals shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className='flex items-center justify-center gap-2 text-xl font-bold'>
              <p>Powered &rarr;</p>
              {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </CardTitle>
            <CardDescription>
              {mode === 'sign-in'
                ? 'Enter your credentials to access your account'
                : 'Enter your details to create an account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'sign-up' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                {isLoading
                  ? (mode === 'sign-in' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'sign-in' ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center font-bold">
          <p className="text-sm font-bold text-foreground">
            {mode === 'sign-in' ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-red-950 font-bold underline cursor-pointer"
              onClick={toggleMode}
            >
              {mode === 'sign-in' ? 'Sign up here' : 'Sign in here'}
            </Button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center bg-white/30 width-full text-sm text-foreground space-y-1">
          <p>© {new Date().getFullYear()} Hospice::Colony. All rights reserved.</p>
          <p>Secure authentication system</p>
        </div>
      </div>
    </div>
  );
}