import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertTriangle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                        
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Your cart items have been saved. You can review your order and try again with a different payment method.
                            </AlertDescription>
                        </Alert>

                        <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
                            <p className="font-medium">Common reasons for payment failure:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Insufficient funds in your account</li>
                                <li>Expired or invalid card details</li>
                                <li>Payment was cancelled during checkout</li>
                                <li>Card issuer declined the transaction</li>
                                <li>Incorrect billing information</li>
                            </ul>
                        </div>

                        <p className="text-muted-foreground">
                            If you continue to experience issues, please contact your card issuer or try a different payment method.
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
