import React, { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, Package, Music, Briefcase, Heart, Link as LinkIcon } from 'lucide-react';
import { useCart } from '../hooks/useCart';

type PaymentContext = {
  type: 'product' | 'gig' | 'music' | 'donation' | 'stripe-connect';
  productId?: string;
  gigId?: string;
  musicId?: string;
  artistId?: string;
  amount?: number;
};

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const search = useSearch({ strict: false }) as any;

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();

    // Check if this is a Stripe Connect OAuth return
    if (search?.code && search?.state) {
      setPaymentContext({ type: 'stripe-connect' });
      return;
    }

    // Retrieve payment context
    const contextStr = sessionStorage.getItem('paymentContext');
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr) as PaymentContext;
        setPaymentContext(context);
        sessionStorage.removeItem('paymentContext');
      } catch (error) {
        console.error('Failed to parse payment context:', error);
      }
    }
  }, [clearCart, search]);

  const getIcon = () => {
    switch (paymentContext?.type) {
      case 'product':
        return <Package className="h-16 w-16 text-primary" />;
      case 'music':
        return <Music className="h-16 w-16 text-primary" />;
      case 'gig':
        return <Briefcase className="h-16 w-16 text-primary" />;
      case 'donation':
        return <Heart className="h-16 w-16 text-primary" />;
      case 'stripe-connect':
        return <LinkIcon className="h-16 w-16 text-primary" />;
      default:
        return <CheckCircle2 className="h-16 w-16 text-primary" />;
    }
  };

  const getTitle = () => {
    switch (paymentContext?.type) {
      case 'product':
        return 'Order Confirmed!';
      case 'music':
        return 'Music Purchase Complete!';
      case 'gig':
        return 'Gig Booked Successfully!';
      case 'donation':
        return 'Thank You for Your Support!';
      case 'stripe-connect':
        return 'Stripe Account Connected!';
      default:
        return 'Payment Successful!';
    }
  };

  const getDescription = () => {
    switch (paymentContext?.type) {
      case 'product':
        return 'Your order has been confirmed and is being processed. You will receive a confirmation email shortly.';
      case 'music':
        return 'Your music purchase is complete. You can now access your music in your library.';
      case 'gig':
        return 'Your gig booking has been confirmed. The artist will contact you soon to discuss the details.';
      case 'donation':
        return paymentContext.amount
          ? `Your donation of $${(paymentContext.amount / 100).toFixed(2)} has been received. Thank you for supporting this artist!`
          : 'Your donation has been received. Thank you for supporting this artist!';
      case 'stripe-connect':
        return 'Your Stripe account has been successfully connected. You can now receive payments directly from customers.';
      default:
        return 'Your payment has been processed successfully. Thank you for your purchase!';
    }
  };

  const getNextStepButton = () => {
    switch (paymentContext?.type) {
      case 'product':
        return (
          <Button onClick={() => navigate({ to: '/account/products' })} size="lg">
            <Package className="mr-2 h-4 w-4" />
            View My Orders
          </Button>
        );
      case 'music':
        return (
          <Button onClick={() => navigate({ to: '/music' })} size="lg">
            <Music className="mr-2 h-4 w-4" />
            Go to Music Library
          </Button>
        );
      case 'gig':
        return (
          <Button onClick={() => navigate({ to: '/bookings' })} size="lg">
            <Briefcase className="mr-2 h-4 w-4" />
            View My Bookings
          </Button>
        );
      case 'donation':
        return paymentContext.artistId ? (
          <Button onClick={() => navigate({ to: `/artists/${paymentContext.artistId}` })} size="lg">
            View Artist Profile
          </Button>
        ) : null;
      case 'stripe-connect':
        return (
          <Button onClick={() => navigate({ to: '/account/dashboard' })} size="lg">
            Go to Dashboard
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">{getIcon()}</div>
            <CardTitle className="text-3xl">{getTitle()}</CardTitle>
            <CardDescription className="text-base">{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentContext?.type === 'product' && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  A portion of your purchase goes directly to the artist who created this product.
                </p>
              </div>
            )}
            {paymentContext?.type === 'donation' && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  100% of your donation goes directly to the artist to support their creative work.
                </p>
              </div>
            )}
            {paymentContext?.type === 'stripe-connect' && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You'll now receive 90% of all sales directly to your Stripe account, with 10% going to platform fees.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            {getNextStepButton()}
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
