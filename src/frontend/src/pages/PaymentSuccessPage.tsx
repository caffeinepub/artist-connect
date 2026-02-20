import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useCart } from '../hooks/useCart';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

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
                        <p className="text-xl text-muted-foreground">
                            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                        </p>
                        <p className="text-muted-foreground">
                            You will receive a confirmation email with your order details.
                        </p>
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
