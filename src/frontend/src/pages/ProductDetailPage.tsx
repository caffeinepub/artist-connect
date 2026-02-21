import { useParams, Link } from '@tanstack/react-router';
import { useGetAllProducts, useCheckoutProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
    const { id } = useParams({ from: '/store/$id' });
    const { data: products, isLoading } = useGetAllProducts();
    const { identity } = useInternetIdentity();
    const checkoutProduct = useCheckoutProduct();
    const product = products?.find((p) => p.id === id);

    const handleBuyNow = async () => {
        if (!identity) {
            toast.error('Please log in to make a purchase');
            return;
        }

        if (!product) return;

        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const successUrl = `${baseUrl}/payment-success`;
        const cancelUrl = `${baseUrl}/payment-failure`;

        try {
            const session = await checkoutProduct.mutateAsync({
                productId: product.id,
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
            <div className="container py-12">
                <div className="max-w-5xl mx-auto">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center max-w-2xl mx-auto">
                    <h2 className="font-display text-3xl font-bold mb-4">Product Not Found</h2>
                    <p className="text-muted-foreground mb-6">This product doesn't exist or has been removed.</p>
                    <Button asChild>
                        <Link to="/store">Browse Store</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="max-w-5xl mx-auto">
                <Button asChild variant="ghost" className="mb-6">
                    <Link to="/store">← Back to Store</Link>
                </Button>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                        {product.productImages.length > 0 ? (
                            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-artistic-lg">
                                <img
                                    src={product.productImages[0].getDirectURL()}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
                                <ShoppingCart className="h-24 w-24 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="font-display text-4xl font-bold mb-4">{product.title}</h1>
                            <p className="text-4xl font-bold text-primary">${Number(product.price) / 100}</p>
                        </div>

                        <div>
                            <h3 className="font-display text-xl font-semibold mb-3">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                        </div>

                        <div className="pt-6 border-t space-y-3">
                            <Button 
                                size="lg" 
                                className="w-full" 
                                onClick={handleBuyNow}
                                disabled={!identity || checkoutProduct.isPending}
                            >
                                {checkoutProduct.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-5 w-5" />
                                        Buy Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
