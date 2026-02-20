import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAssignAdminPrivileges } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export default function AdminSetupPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const assignAdminPrivileges = useAssignAdminPrivileges();

  const principalId = identity?.getPrincipal().toString();

  const handleGrantAdmin = async () => {
    if (!identity) {
      toast.error('Please log in first');
      return;
    }

    try {
      await assignAdminPrivileges.mutateAsync(identity.getPrincipal());
      toast.success('Admin privileges granted successfully!');
      
      // Wait a moment for the backend to update, then redirect
      setTimeout(() => {
        navigate({ to: '/admin/users' });
      }, 1500);
    } catch (error: any) {
      console.error('Failed to grant admin privileges:', error);
      toast.error(error.message || 'Failed to grant admin privileges');
    }
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please log in with Internet Identity to grant admin privileges.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Setup</CardTitle>
            </div>
            <CardDescription>
              Grant admin privileges to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Principal ID</h3>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                {principalId}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will grant full admin privileges to your account. You will be able to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Manage all users and their roles</li>
                  <li>Configure site settings</li>
                  <li>Manage store configuration</li>
                  <li>Configure Stripe payment settings</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleGrantAdmin}
              disabled={assignAdminPrivileges.isPending}
              className="w-full"
              size="lg"
            >
              {assignAdminPrivileges.isPending ? (
                'Granting Admin Privileges...'
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Grant Admin Privileges
                </>
              )}
            </Button>

            {assignAdminPrivileges.isSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Admin privileges have been granted. Redirecting to admin panel...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click the "Grant Admin Privileges" button above</li>
              <li>Wait for the confirmation message</li>
              <li>Check that the admin dropdown menu appears in the header</li>
              <li>Navigate to each admin page to verify access:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>User Management</li>
                  <li>Site Settings</li>
                  <li>Store Settings</li>
                  <li>Stripe Settings</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
