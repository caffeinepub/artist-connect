import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function PaymentFailurePage() {
    return (
        <div className="container py-12">
            <div className="max-w-2xl mx-auto">
                <Card className="text-center p-8">
                    <CardHeader>
                        <div className="mx-auto mb-6">
                            <XCircle className="h-20 w-20 text-destructive mx-auto" />
                        </div>
                        <CardTitle className="font-display text-3xl md:text-4xl mb-4">
                            Payment Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-xl text-muted-foreground">
                            We couldn't process your payment. This could be due to insufficient funds, an expired card, or the payment was cancelled.
                        </p>
                        <p className="text-muted-foreground">
                            Your cart items have been saved. Please try again or contact support if the problem persists.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Button asChild size="lg">
                                <Link to="/cart">Return to Cart</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/">Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
