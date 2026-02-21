import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGrantAdminPrivileges, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, refetch: refetchAdminStatus } = useIsCallerAdmin();
  const grantAdminMutation = useGrantAdminPrivileges();
  const [setupComplete, setSetupComplete] = useState(false);

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() || '';

  useEffect(() => {
    if (isAdmin) {
      const timer = setTimeout(() => {
        navigate({ to: '/account/dashboard' });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, navigate]);

  const handleGrantAdmin = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      return;
    }

    try {
      await grantAdminMutation.mutateAsync();
      await refetchAdminStatus();
      setSetupComplete(true);
      toast.success('Admin privileges granted successfully!');
      
      // Redirect to account dashboard after a short delay
      setTimeout(() => {
        navigate({ to: '/account/dashboard' });
      }, 2000);
    } catch (error: any) {
      console.error('Failed to grant admin privileges:', error);
      toast.error(error.message || 'Failed to grant admin privileges');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access admin setup.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            You already have admin privileges. Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Setup</h1>
        <p className="text-muted-foreground">Grant yourself admin privileges to manage the marketplace</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>Grant Admin Privileges</CardTitle>
              <CardDescription>Become an administrator of this marketplace</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {setupComplete ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Admin privileges granted successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Your Principal ID</h3>
                  <code className="text-sm bg-muted px-3 py-2 rounded block break-all">
                    {principalId}
                  </code>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What you'll be able to do as admin:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Configure Stripe payment integration</li>
                    <li>Manage store settings and product categories</li>
                    <li>View and manage all marketplace content</li>
                    <li>Access admin-only features and settings</li>
                  </ul>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This action will grant full administrative access to your account. Make sure you're logged in with the correct identity.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGrantAdmin}
                  disabled={grantAdminMutation.isPending}
                  className="flex-1"
                >
                  {grantAdminMutation.isPending ? 'Granting Access...' : 'Grant Admin Access'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/account/dashboard' })}
                  disabled={grantAdminMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
