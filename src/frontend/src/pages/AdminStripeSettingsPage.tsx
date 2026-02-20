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
import { CreditCard, ShieldAlert, AlertCircle, Save, Eye, EyeOff, Copy, ExternalLink, Info, Car, Music, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStripeSettingsPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
    const { data: stripeConfig, isLoading: configLoading, isFetched, error: configError } = useGetStripeStoreConfig();
    const updateConfig = useSetStripeStoreConfig();

    const [publishableKey, setPublishableKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [webhookEndpoint, setWebhookEndpoint] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [testMode, setTestMode] = useState(true);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);

    // Validation errors
    const [publishableKeyError, setPublishableKeyError] = useState('');
    const [secretKeyError, setSecretKeyError] = useState('');

    const isAuthenticated = !!identity;

    useEffect(() => {
        if (stripeConfig) {
            setPublishableKey(stripeConfig.publishableKey || '');
            setSecretKey(stripeConfig.secretKey || '');
            setWebhookSecret(stripeConfig.webhookSecret || '');
            setWebhookEndpoint(stripeConfig.webhookEndpoint || '');
            setCurrency(stripeConfig.currency || 'USD');
            setTestMode(stripeConfig.testMode ?? true);
        }
    }, [stripeConfig]);

    // Validate publishable key
    const validatePublishableKey = (value: string) => {
        if (value && !value.startsWith('pk_')) {
            setPublishableKeyError('Publishable key must start with pk_');
            return false;
        }
        setPublishableKeyError('');
        return true;
    };

    // Validate secret key
    const validateSecretKey = (value: string) => {
        if (value && !value.startsWith('sk_')) {
            setSecretKeyError('Secret key must start with sk_');
            return false;
        }
        setSecretKeyError('');
        return true;
    };

    const handleSave = async () => {
        // Validate keys before saving
        const isPubKeyValid = validatePublishableKey(publishableKey);
        const isSecKeyValid = validateSecretKey(secretKey);

        if (!isPubKeyValid || !isSecKeyValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        if (!publishableKey || !secretKey) {
            toast.error('Publishable key and secret key are required');
            return;
        }

        try {
            await updateConfig.mutateAsync({
                publishableKey,
                secretKey,
                webhookSecret,
                webhookEndpoint,
                currency,
                testMode,
            });
            toast.success('Stripe configuration saved successfully');
        } catch (error: any) {
            console.error('Error saving Stripe config:', error);
            toast.error(error.message || 'Failed to save Stripe configuration');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAdminLoading && !isAuthenticated) {
            navigate({ to: '/' });
        }
    }, [isAuthenticated, isAdminLoading, navigate]);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdminLoading && isAuthenticated && isAdmin === false) {
            toast.error('Access denied. Admin privileges required.');
            navigate({ to: '/' });
        }
    }, [isAdmin, isAdminLoading, isAuthenticated, navigate]);

    if (isAdminLoading || configLoading || !isAuthenticated) {
        return (
            <div className="container py-12">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="font-display text-4xl font-bold mb-2">Stripe Payment Settings</h1>
                    <p className="text-muted-foreground">
                        Configure Stripe to accept payments for all products, services, and content
                    </p>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-medium">This Stripe configuration applies to all payment types:</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    <span>Car & Vehicle Products</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4" />
                                    <span>Music Tracks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Gigs & Services</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>All Other Products</span>
                                </div>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>

                {configError && !isFetched && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Stripe is not configured yet. Please set up your Stripe account below.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            <CardTitle>API Keys</CardTitle>
                        </div>
                        <CardDescription>
                            Get your API keys from the{' '}
                            <a
                                href="https://dashboard.stripe.com/apikeys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                Stripe Dashboard
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publishableKey">Publishable Key *</Label>
                            <Input
                                id="publishableKey"
                                placeholder="pk_test_..."
                                value={publishableKey}
                                onChange={(e) => {
                                    setPublishableKey(e.target.value);
                                    validatePublishableKey(e.target.value);
                                }}
                                className={publishableKeyError ? 'border-destructive' : ''}
                            />
                            {publishableKeyError && (
                                <p className="text-sm text-destructive">{publishableKeyError}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Used on the client side. Safe to expose publicly.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secretKey">Secret Key *</Label>
                            <div className="relative">
                                <Input
                                    id="secretKey"
                                    type={showSecretKey ? 'text' : 'password'}
                                    placeholder="sk_test_..."
                                    value={secretKey}
                                    onChange={(e) => {
                                        setSecretKey(e.target.value);
                                        validateSecretKey(e.target.value);
                                    }}
                                    className={secretKeyError ? 'border-destructive pr-10' : 'pr-10'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                >
                                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {secretKeyError && (
                                <p className="text-sm text-destructive">{secretKeyError}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Used on the server side. Keep this confidential.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            <CardTitle>Webhook Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Configure webhooks to receive payment events from Stripe
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="webhookSecret">Webhook Secret</Label>
                            <div className="relative">
                                <Input
                                    id="webhookSecret"
                                    type={showWebhookSecret ? 'text' : 'password'}
                                    placeholder="whsec_..."
                                    value={webhookSecret}
                                    onChange={(e) => setWebhookSecret(e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                >
                                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="webhookEndpoint">Webhook Endpoint URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="webhookEndpoint"
                                    placeholder="https://your-domain.com/webhook"
                                    value={webhookEndpoint}
                                    onChange={(e) => setWebhookEndpoint(e.target.value)}
                                    className="flex-1"
                                />
                                {webhookEndpoint && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyToClipboard(webhookEndpoint, 'Webhook endpoint')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Settings</CardTitle>
                        <CardDescription>
                            Configure currency and testing mode for all payment types
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger id="currency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label htmlFor="testMode">Test Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Use test mode to process test payments for cars, music, gigs, and other products before going live
                                </p>
                            </div>
                            <Switch
                                id="testMode"
                                checked={testMode}
                                onCheckedChange={setTestMode}
                            />
                        </div>

                        {testMode && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Test mode is enabled. Use Stripe test cards to simulate payments. No real charges will be made.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: '/' })}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateConfig.isPending || !!publishableKeyError || !!secretKeyError}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {updateConfig.isPending ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
