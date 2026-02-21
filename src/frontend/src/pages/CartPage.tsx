import React from 'react';
import { useCreateCheckoutSession, useIsStripeConfigured, useIsCallerAdmin } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingItem } from '../backend';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getCartTotal } = useCart();
  const { identity } = useInternetIdentity();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const { data: isAdmin } = useIsCallerAdmin();

  const handleCheckout = async () => {
    if (!identity) {
      toast.error('Please log in to checkout');
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Stripe is not configured. Please contact the administrator.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const shoppingItems: ShoppingItem[] = items.map((item) => ({
      currency: 'USD',
      productName: item.name,
      productDescription: item.description || '',
      priceInCents: BigInt(Math.round(item.price * 100)),
      quantity: BigInt(item.quantity || 1),
    }));

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-failure`;

    try {
      const session = await createCheckoutSession.mutateAsync({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      sessionStorage.setItem('paymentType', 'cart');
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session. Please try again.');
    }
  };

  if (stripeConfigLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {!isStripeConfigured && isAdmin && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe is not configured. Please configure Stripe in the admin settings to enable checkout.
          </AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to get started!</p>
          <Button asChild>
            <a href="/store">Browse Store</a>
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.type}-${item.id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {item.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                        {item.quantity && item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({items.length})</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!identity || !isStripeConfigured || createCheckoutSession.isPending}
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
