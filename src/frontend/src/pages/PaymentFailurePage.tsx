import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Home, RefreshCw, AlertCircle } from 'lucide-react';

type PaymentContext = {
  type: 'product' | 'gig' | 'music' | 'donation' | 'stripe-connect';
  productId?: string;
  gigId?: string;
  musicId?: string;
  artistId?: string;
};

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const search = useSearch({ strict: false }) as any;

  useEffect(() => {
    // Check if this is a Stripe Connect OAuth error
    if (search?.error) {
      setPaymentContext({ type: 'stripe-connect' });
      return;
    }

    const contextStr = sessionStorage.getItem('paymentContext');
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr) as PaymentContext;
        setPaymentContext(context);
      } catch (error) {
        console.error('Failed to parse payment context:', error);
      }
    }
  }, [search]);

  const getRetryAction = () => {
    switch (paymentContext?.type) {
      case 'product':
        return paymentContext.productId
          ? () => navigate({ to: `/store/${paymentContext.productId}` })
          : () => navigate({ to: '/store' });
      case 'music':
        return () => navigate({ to: '/music' });
      case 'gig':
        return paymentContext.gigId
          ? () => navigate({ to: `/gigs/${paymentContext.gigId}` })
          : () => navigate({ to: '/' });
      case 'donation':
        return paymentContext.artistId
          ? () => navigate({ to: `/artists/${paymentContext.artistId}` })
          : () => navigate({ to: '/' });
      case 'stripe-connect':
        return () => navigate({ to: '/stripe-connect' });
      default:
        return () => navigate({ to: '/' });
    }
  };

  const getRetryButtonText = () => {
    switch (paymentContext?.type) {
      case 'product':
        return 'Return to Product';
      case 'music':
        return 'Return to Music Library';
      case 'gig':
        return 'Return to Gig';
      case 'donation':
        return 'Try Donation Again';
      case 'stripe-connect':
        return 'Try Connecting Again';
      default:
        return 'Try Again';
    }
  };

  const getErrorMessage = () => {
    if (paymentContext?.type === 'stripe-connect') {
      return 'We were unable to connect your Stripe account. This could be due to cancellation or an error during the connection process.';
    }
    return 'We were unable to process your payment. Please try again or use a different payment method.';
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-3xl">
              {paymentContext?.type === 'stripe-connect' ? 'Connection Failed' : 'Payment Failed'}
            </CardTitle>
            <CardDescription className="text-base">{getErrorMessage()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Common reasons for {paymentContext?.type === 'stripe-connect' ? 'connection' : 'payment'} failure:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  {paymentContext?.type === 'stripe-connect' ? (
                    <>
                      <li>Connection process was cancelled</li>
                      <li>Invalid or incomplete account information</li>
                      <li>Account verification issues</li>
                      <li>Network connection problems</li>
                    </>
                  ) : (
                    <>
                      <li>Insufficient funds in your account</li>
                      <li>Incorrect card details or expired card</li>
                      <li>Payment declined by your bank</li>
                      <li>Network connection issues</li>
                    </>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            {paymentContext?.type && (
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm font-medium mb-2">
                  {paymentContext.type === 'stripe-connect' ? 'Connection Type:' : 'Payment Type:'}
                </p>
                <p className="text-sm text-muted-foreground capitalize">{paymentContext.type}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={getRetryAction()} size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              {getRetryButtonText()}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} size="lg">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
