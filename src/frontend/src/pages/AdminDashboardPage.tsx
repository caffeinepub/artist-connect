import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Settings, BarChart3, Users, CreditCard, Palette, DollarSign, ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is restricted to administrators only. You do not have permission to access this area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin control panel. Manage your platform settings and monitor performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/stripe-settings' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Stripe Settings</CardTitle>
            </div>
            <CardDescription>Configure payment processing and Stripe integration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Manage Stripe
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/users' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>View and manage platform users and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/revenue' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Revenue Analytics</CardTitle>
            </div>
            <CardDescription>Monitor platform revenue and transaction metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/branding' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Branding</CardTitle>
            </div>
            <CardDescription>Customize site appearance and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Edit Branding
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/commission' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Commission Settings</CardTitle>
            </div>
            <CardDescription>Configure platform commission rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Adjust Commission
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/store-settings' })}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Store Settings</CardTitle>
            </div>
            <CardDescription>Manage store configuration and product rules</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Configure Store
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
