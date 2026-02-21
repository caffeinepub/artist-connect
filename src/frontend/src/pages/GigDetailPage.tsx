import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetGigById, useCheckoutGig } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function GigDetailPage() {
  const { id } = useParams({ from: '/gigs/$id' });
  const navigate = useNavigate();
  const { data: gig, isLoading } = useGetGigById(id);
  const { identity } = useInternetIdentity();
  const checkoutGig = useCheckoutGig();

  const handleBookNow = async () => {
    if (!identity) {
      toast.error('Please log in to book this gig');
      return;
    }

    if (!gig) {
      toast.error('Gig not found');
      return;
    }

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-failure`;

    try {
      const session = await checkoutGig.mutateAsync({
        gigId: gig.id,
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const deliveryDays = Math.ceil(Number(gig.deliveryTime) / (24 * 60 * 60 * 1000000000));

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{gig.title}</CardTitle>
              <CardDescription>Gig ID: {gig.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{gig.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery Time</h3>
                <Badge variant="secondary">{deliveryDays} days</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">${(Number(gig.pricing) / 100).toFixed(2)}</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{deliveryDays} days</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleBookNow}
                disabled={!identity || checkoutGig.isPending}
              >
                {checkoutGig.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Book Now
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
