import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Package, Settings, Shield } from 'lucide-react';

export default function AccountDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() || 'Not logged in';

  const showAdminSetup = isAuthenticated && !adminLoading && adminFetched && !isAdmin;
  const showStripeSettings = isAuthenticated && !adminLoading && adminFetched && isAdmin;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Dashboard</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Principal ID Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your Internet Identity principal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <code className="text-sm bg-muted px-2 py-1 rounded break-all">{principalId}</code>
          </div>
          {showAdminSetup && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                You don't have admin privileges yet. Grant yourself admin access to configure Stripe and other settings.
              </p>
              <Button
                onClick={() => navigate({ to: '/admin-setup' })}
                variant="default"
                size="sm"
              >
                Grant Admin Access
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/account/products' })}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Product Management</CardTitle>
                <CardDescription>Manage your products</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View, edit, and manage all your listed products in one place.
            </p>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/account/payments' })}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Payment Settings</CardTitle>
                <CardDescription>View payment information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View your payment methods and transaction history.
            </p>
          </CardContent>
        </Card>

        {/* Stripe Settings - Admin Only */}
        {showStripeSettings && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20" onClick={() => navigate({ to: '/admin/stripe-settings' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Stripe Settings
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Admin</span>
                  </CardTitle>
                  <CardDescription>Configure payment processing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure Stripe integration for accepting payments on your marketplace.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {adminLoading && (
        <div className="mt-8 text-center text-muted-foreground">
          <p>Loading account permissions...</p>
        </div>
      )}
    </div>
  );
}
