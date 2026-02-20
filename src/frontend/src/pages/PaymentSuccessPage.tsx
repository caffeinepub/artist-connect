import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Music, Briefcase } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useCart } from '../hooks/useCart';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
    const { items, clearCart } = useCart();
    const [purchaseTypes, setPurchaseTypes] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Capture item types before clearing cart
        const types = new Set(items.map(item => item.type));
        setPurchaseTypes(types);
        clearCart();
    }, [clearCart, items]);

    // Generate contextual success message based on purchase types
    const getSuccessMessage = () => {
        if (purchaseTypes.has('product')) {
            return 'Your order has been confirmed and will be processed shortly. You will receive updates on your purchase.';
        }
        if (purchaseTypes.has('music')) {
            return 'Your music purchase has been confirmed. You can now access your purchased tracks.';
        }
        if (purchaseTypes.has('gig')) {
            return 'Your gig booking has been confirmed. The artist will be in touch with you soon.';
        }
        return 'Your order has been confirmed and will be processed shortly.';
    };

    const getIcon = () => {
        if (purchaseTypes.has('product')) return <Package className="h-8 w-8" />;
        if (purchaseTypes.has('music')) return <Music className="h-8 w-8" />;
        if (purchaseTypes.has('gig')) return <Briefcase className="h-8 w-8" />;
        return <Package className="h-8 w-8" />;
    };

    return (
        <div className="container py-12">
            <div className="max-w-2xl mx-auto">
                <Card className="text-center p-8">
                    <CardHeader>
                        <div className="mx-auto mb-6">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                        </div>
                        <CardTitle className="font-display text-3xl md:text-4xl mb-4">
                            Payment Successful!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            {getIcon()}
                            <p className="text-xl">
                                {getSuccessMessage()}
                            </p>
                        </div>
                        <p className="text-muted-foreground">
                            You will receive a confirmation email with your order details and next steps.
                        </p>
                        {purchaseTypes.has('product') && (
                            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                                <p className="font-medium mb-1">What's next?</p>
                                <p>Your product order is being prepared. You'll receive shipping information once your items are dispatched.</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Button asChild size="lg">
                                <Link to="/">Return Home</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/store">Continue Shopping</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
