import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CreditCard, Info, User } from 'lucide-react';

export default function PaymentSettingsPage() {
    const { identity, isInitializing } = useInternetIdentity();

    const isAuthenticated = !!identity;
    const principalId = identity?.getPrincipal().toString() || '';

    if (isInitializing) {
        return (
            <div className="container py-12 max-w-4xl">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
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
                        Please log in to access your payment settings.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Payment Settings</h1>
                <p className="text-muted-foreground text-lg">
                    View your payment history and manage payment preferences
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle className="font-display">Account Information</CardTitle>
                        </div>
                        <CardDescription>
                            Your account details for payment processing
                        </CardDescription>
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

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <CardTitle className="font-display">Payment Methods</CardTitle>
                        </div>
                        <CardDescription>
                            Manage your payment methods and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                All payments are securely processed through Stripe. Payment methods are managed
                                during checkout and are not stored on our platform for security reasons.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display">Transaction History</CardTitle>
                        <CardDescription>
                            View your past purchases and transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-display text-xl font-semibold mb-2">No Transactions Yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Your transaction history will appear here once you make purchases. All payments
                                are processed securely through Stripe.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display">Payment Information</CardTitle>
                        <CardDescription>
                            How payments work on ArtistConnect
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Secure Payments</h4>
                            <p className="text-sm text-muted-foreground">
                                All transactions are processed through Stripe, a secure payment platform trusted
                                by millions of businesses worldwide. We never store your payment card details.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Supported Payment Methods</h4>
                            <p className="text-sm text-muted-foreground">
                                We accept all major credit and debit cards including Visa, Mastercard, American
                                Express, and Discover.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Transaction Records</h4>
                            <p className="text-sm text-muted-foreground">
                                After each purchase, you'll receive a confirmation email with your transaction
                                details and receipt from Stripe.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
