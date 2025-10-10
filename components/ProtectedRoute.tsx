"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="auth-loading mx-auto"></div>
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              Loading...
            </h2>
            <p className="font-body text-muted-foreground">
              Please wait while we verify your access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              Access Restricted
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              You need to be logged in to access this section.
            </p>
            <div className="flex justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-sparkle-dance" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
