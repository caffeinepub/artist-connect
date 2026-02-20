import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetAllGigs } from '../hooks/useQueries';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, User } from 'lucide-react';
import { toast } from 'sonner';

export default function GigDetailPage() {
    const { id } = useParams({ from: '/gigs/$id' });
    const { data: gigs, isLoading } = useGetAllGigs();
    const gig = gigs?.find((g) => g.id === id);
    const createCheckout = useCreateCheckoutSession();
    const navigate = useNavigate();

    const handleBookNow = async () => {
        if (!gig) return;

        try {
            const session = await createCheckout.mutateAsync([
                {
                    productName: gig.title,
                    productDescription: gig.description,
                    priceInCents: gig.pricing,
                    quantity: BigInt(1),
                    currency: 'usd'
                }
            ]);

            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }

            window.location.href = session.url;
        } catch (error) {
            toast.error('Failed to initiate checkout');
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-12">
                <div className="max-w-3xl mx-auto">Loading...</div>
            </div>
        );
    }

    if (!gig) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center max-w-2xl mx-auto">
                    <h2 className="font-display text-3xl font-bold mb-4">Gig Not Found</h2>
                    <p className="text-muted-foreground mb-6">This gig doesn't exist or has been removed.</p>
                    <Button asChild>
                        <Link to="/gigs">Browse Gigs</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto">
                <Button asChild variant="ghost" className="mb-6">
                    <Link to="/gigs">← Back to Gigs</Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display text-3xl md:text-4xl">{gig.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <span className="font-bold text-primary text-lg">${Number(gig.pricing) / 100}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {Math.round(
                                        (Number(gig.deliveryTime) - Date.now() * 1_000_000) /
                                            (24 * 60 * 60 * 1_000_000_000)
                                    )}{' '}
                                    days delivery
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-display text-xl font-semibold mb-3">About This Gig</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{gig.description}</p>
                        </div>

                        <div className="pt-6 border-t">
                            <Button
                                size="lg"
                                className="w-full md:w-auto"
                                onClick={handleBookNow}
                                disabled={createCheckout.isPending}
                            >
                                {createCheckout.isPending ? 'Processing...' : 'Book Now'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
