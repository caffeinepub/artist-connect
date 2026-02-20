import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetStripeStoreConfig, useSetStripeStoreConfig } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ShieldAlert, AlertCircle, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripeSettingsPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
    const { data: stripeConfig, isLoading: configLoading, error: configError } = useGetStripeStoreConfig();
    const updateConfig = useSetStripeStoreConfig();

    const [publishableKey, setPublishableKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [webhookEndpoint, setWebhookEndpoint] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [testMode, setTestMode] = useState(true);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);

    const isAuthenticated = !!identity;

    useEffect(() => {
        if (stripeConfig) {
            setPublishableKey(stripeConfig.publishableKey);
            setSecretKey(stripeConfig.secretKey);
            setWebhookSecret(stripeConfig.webhookSecret);
            setWebhookEndpoint(stripeConfig.webhookEndpoint);
            setCurrency(stripeConfig.currency);
            setTestMode(stripeConfig.testMode);
        }
    }, [stripeConfig]);

    const handleSave = async () => {
        try {
            // Validate inputs
            if (!publishableKey.trim()) {
                toast.error('Publishable key is required');
                return;
            }
            if (!secretKey.trim()) {
                toast.error('Secret key is required');
                return;
            }
            if (!webhookSecret.trim()) {
                toast.error('Webhook secret is required');
                return;
            }
            if (!webhookEndpoint.trim()) {
                toast.error('Webhook endpoint is required');
                return;
            }

            // Validate webhook endpoint URL format
            try {
                new URL(webhookEndpoint);
            } catch {
                toast.error('Webhook endpoint must be a valid URL');
                return;
            }

            await updateConfig.mutateAsync({
                publishableKey: publishableKey.trim(),
                secretKey: secretKey.trim(),
                webhookSecret: webhookSecret.trim(),
                webhookEndpoint: webhookEndpoint.trim(),
                currency,
                testMode
            });

            toast.success('Stripe settings saved successfully');
        } catch (error: any) {
            console.error('Error saving Stripe settings:', error);
            toast.error(error.message || 'Failed to save Stripe settings');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-12">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to access the admin panel.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isAdminLoading || configLoading) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container py-12">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                        Access denied. You do not have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <CardTitle className="text-3xl font-display">Stripe Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure Stripe payment integration for your marketplace
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {configError && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No Stripe configuration found. Please set up your Stripe settings below.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="publishableKey">Publishable Key</Label>
                                    <Input
                                        id="publishableKey"
                                        value={publishableKey}
                                        onChange={(e) => setPublishableKey(e.target.value)}
                                        placeholder="pk_test_..."
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Your Stripe publishable key (starts with pk_)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secretKey">Secret Key</Label>
                                    <div className="relative">
                                        <Input
                                            id="secretKey"
                                            type={showSecretKey ? 'text' : 'password'}
                                            value={secretKey}
                                            onChange={(e) => setSecretKey(e.target.value)}
                                            placeholder="sk_test_..."
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() => setShowSecretKey(!showSecretKey)}
                                        >
                                            {showSecretKey ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Your Stripe secret key (starts with sk_)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Webhook Configuration</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                                    <div className="relative">
                                        <Input
                                            id="webhookSecret"
                                            type={showWebhookSecret ? 'text' : 'password'}
                                            value={webhookSecret}
                                            onChange={(e) => setWebhookSecret(e.target.value)}
                                            placeholder="whsec_..."
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                        >
                                            {showWebhookSecret ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Your Stripe webhook signing secret
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="webhookEndpoint">Webhook Endpoint URL</Label>
                                    <Input
                                        id="webhookEndpoint"
                                        type="url"
                                        value={webhookEndpoint}
                                        onChange={(e) => setWebhookEndpoint(e.target.value)}
                                        placeholder="https://your-domain.com/webhook"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        The URL where Stripe will send webhook events
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Payment Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger id="currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Default currency for all transactions
                                    </p>
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="testMode">Test Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Use Stripe test mode for development
                                        </p>
                                    </div>
                                    <Switch
                                        id="testMode"
                                        checked={testMode}
                                        onCheckedChange={setTestMode}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            onClick={handleSave}
                            disabled={updateConfig.isPending}
                            size="lg"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateConfig.isPending ? 'Saving...' : 'Save Stripe Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
