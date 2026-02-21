import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Shield, DollarSign, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeConnectOnboardingPage() {
  const { identity } = useInternetIdentity();

  const handleConnectStripe = () => {
    // Note: Stripe Connect OAuth flow requires backend implementation
    // The backend would need to create a Stripe Connect account link and return the URL
    // For now, we show a message that this feature requires admin configuration
    toast.info('Stripe Connect integration is being configured. Please contact the platform administrator to complete your Stripe account connection.');
    
    // In a full implementation, this would:
    // 1. Call a backend method to create a Stripe Connect account link
    // 2. Redirect to the Stripe OAuth URL using window.location.href
    // Example:
    // const accountLink = await actor.createStripeConnectAccountLink(returnUrl, refreshUrl);
    // window.location.href = accountLink.url;
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to connect your Stripe account</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Connect Your Stripe Account</h1>
          <p className="text-muted-foreground">Start receiving payments directly to your Stripe account</p>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Stripe Connect allows you to receive payments directly from customers. You'll earn 90% of all sales, with 10% going to platform fees.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Why Connect Stripe?</CardTitle>
              <CardDescription>Secure payment processing for your creative work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">Industry-leading security and fraud protection</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Direct Deposits</h3>
                  <p className="text-sm text-muted-foreground">Payments go directly to your account</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Fast Setup</h3>
                  <p className="text-sm text-muted-foreground">Connect existing account or create new one</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your Stripe account is not yet connected. Connect your account to start receiving payments.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Click "Connect Stripe Account"</h4>
                    <p className="text-sm text-muted-foreground">You'll be redirected to Stripe's secure platform</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Connect or Create Account</h4>
                    <p className="text-sm text-muted-foreground">Link your existing Stripe account or create a new one</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start Receiving Payments</h4>
                    <p className="text-sm text-muted-foreground">Once connected, you'll receive 90% of all sales directly</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleConnectStripe}>
            <ExternalLink className="mr-2 h-5 w-5" />
            Connect Stripe Account
          </Button>
        </div>
      </div>
    </div>
  );
}
