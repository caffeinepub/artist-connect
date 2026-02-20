import { useCart } from '../hooks/useCart';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, Music as MusicIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import type { ShoppingItem } from '../backend';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCart();
    const createCheckoutSession = useCreateCheckoutSession();

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            const shoppingItems: ShoppingItem[] = items.map((item) => ({
                productName: item.type === 'music' ? `${item.name} (Music)` : item.name,
                productDescription: item.description,
                priceInCents: BigInt(Math.round(item.price * 100)),
                quantity: BigInt(item.quantity),
                currency: 'usd'
            }));

            const session = await createCheckoutSession.mutateAsync(shoppingItems);
            
            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }

            window.location.href = session.url;
        } catch (error) {
            toast.error('Failed to create checkout session');
            console.error(error);
        }
    };

    const total = getCartTotal();

    return (
        <div className="container py-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Shopping Cart</h1>

            {items.length === 0 ? (
                <Card className="p-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-6">Add some items to get started!</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link to="/store">Browse Store</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/music">Browse Music</Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                                                {item.type === 'music' ? (
                                                    <MusicIcon className="h-8 w-8 text-muted-foreground" />
                                                ) : (
                                                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                                                    {item.type === 'music' && item.artist && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Artist: {item.artist.slice(0, 8)}...
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        Type: {item.type}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-lg font-bold text-primary">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle className="font-display text-2xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Items</span>
                                        <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">${total.toFixed(2)}</span>
                                </div>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={createCheckoutSession.isPending}
                                >
                                    {createCheckoutSession.isPending ? 'Processing...' : 'Proceed to Checkout'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={clearCart}
                                >
                                    Clear Cart
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
