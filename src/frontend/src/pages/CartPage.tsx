import { useCart } from '../hooks/useCart';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getCartTotal } = useCart();
    const createCheckout = useCreateCheckoutSession();

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            const shoppingItems = items.map((item) => ({
                productName: item.name,
                productDescription: item.description,
                priceInCents: BigInt(Math.round(item.price * 100)),
                quantity: BigInt(item.quantity),
                currency: 'usd'
            }));

            const session = await createCheckout.mutateAsync(shoppingItems);

            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }

            window.location.href = session.url;
        } catch (error) {
            toast.error('Failed to initiate checkout');
            console.error(error);
        }
    };

    return (
        <div className="container py-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-12">Shopping Cart</h1>

            {items.length === 0 ? (
                <Card className="p-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">Your Cart is Empty</h3>
                    <p className="text-muted-foreground mb-6">Add some amazing artwork to get started!</p>
                    <Button asChild>
                        <Link to="/store">Browse Store</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {item.imageUrl && (
                                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-display text-xl font-semibold mb-1">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {item.description}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(item.id, parseInt(e.target.value) || 1)
                                                        }
                                                        className="w-16 text-center"
                                                        min="1"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <span className="font-bold text-lg">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeItem(item.id)}
                                            className="flex-shrink-0"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div>
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle className="font-display">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>${getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between text-xl font-bold mb-6">
                                        <span>Total</span>
                                        <span className="text-primary">${getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        onClick={handleCheckout}
                                        disabled={createCheckout.isPending}
                                    >
                                        {createCheckout.isPending ? 'Processing...' : 'Proceed to Checkout'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
