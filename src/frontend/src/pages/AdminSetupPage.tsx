import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info, ShieldCheck } from 'lucide-react';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  useEffect(() => {
    if (!isAdminLoading && isAdmin) {
      navigate({ to: '/account/dashboard' });
    }
  }, [isAdmin, isAdminLoading, navigate]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access admin setup</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Access</h1>
          <p className="text-muted-foreground">Administrator privileges are pre-configured</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Admin Configuration</CardTitle>
                <CardDescription>Access control is managed by the platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Admin access is pre-configured and restricted to authorized users only. If you need admin privileges, please contact the platform administrator.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your current principal ID: <span className="font-mono">{identity.getPrincipal().toString()}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
