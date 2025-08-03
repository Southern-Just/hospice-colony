import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { HospitalIcon } from 'lucide-react';
import SignIn from "@/app/(auth)/sign-in/page";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                                <HospitalIcon className="w-7 h-7 text-muted-foreground animate-pulse" />
                            </div>
                            <div className="space-y-2 text-center">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <SignIn />;
    }

    return <>{children}</>;
}