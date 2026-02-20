import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Package, CreditCard, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function AccountDashboardPage() {
    const { identity, isInitializing } = useInternetIdentity();

    const isAuthenticated = !!identity;
    const principalId = identity?.getPrincipal().toString() || '';

    if (isInitializing) {
        return (
            <div className="container py-12 max-w-6xl">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-12">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to access your account dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-6xl">
            <div className="mb-8">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Account Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                    Manage your products, payments, and account settings
                </p>
            </div>

            <div className="mb-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle className="font-display">Account Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Principal ID:</span>
                                <p className="text-sm font-mono bg-muted px-3 py-2 rounded mt-1 break-all">
                                    {principalId}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/account/products" className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="font-display text-2xl">Product Management</CardTitle>
                                    <CardDescription className="mt-1">
                                        View and manage your products
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Edit product details, update pricing, manage inventory, and delete products you've created.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/account/payments" className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="font-display text-2xl">Payment Settings</CardTitle>
                                    <CardDescription className="mt-1">
                                        View payment history and preferences
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Review your transaction history, payment methods, and configure payment preferences.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
