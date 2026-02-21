import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CreditCard, Settings, Loader2 } from 'lucide-react';

export default function AccountDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your account dashboard</CardDescription>
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account Dashboard</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Principal ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">{identity.getPrincipal().toString()}</span>
                </div>
                {isAdmin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Role:</span>
                    <span className="text-sm text-muted-foreground">Administrator</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/account/products' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your products and listings</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/account/payments' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>View payment methods and history</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {isAdmin && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/admin/stripe-settings' })}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Stripe Settings</CardTitle>
                    <CardDescription>Configure payment processing (Admin)</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
