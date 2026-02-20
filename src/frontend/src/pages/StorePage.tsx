import { useGetAllProducts, useCreateProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCart } from '../hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { toast } from 'sonner';
import { Store, Plus, ShoppingCart } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ExternalBlob } from '../backend';

export default function StorePage() {
    const { data: products, isLoading } = useGetAllProducts();
    const { identity } = useInternetIdentity();
    const { addItem } = useCart();
    const createProduct = useCreateProduct();
    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [productImage, setProductImage] = useState<ExternalBlob | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });
            setProductImage(blob);
            setUploadProgress(null);
        } catch (error) {
            toast.error('Failed to process image');
            console.error(error);
            setUploadProgress(null);
        }
    };

    const handleCreate = async () => {
        if (!identity || !title.trim() || !description.trim() || !price || !productImage) {
            toast.error('Please fill in all fields and upload an image');
            return;
        }

        try {
            await createProduct.mutateAsync({
                id: `product-${Date.now()}`,
                title: title.trim(),
                description: description.trim(),
                price: BigInt(Math.round(parseFloat(price) * 100)),
                productImages: [productImage]
            });
            toast.success('Product created successfully!');
            setOpen(false);
            setTitle('');
            setDescription('');
            setPrice('');
            setProductImage(null);
        } catch (error) {
            toast.error('Failed to create product');
            console.error(error);
        }
    };

    const handleAddToCart = (product: any) => {
        addItem({
            type: 'product',
            id: product.id,
            name: product.title,
            description: product.description,
            price: Number(product.price) / 100,
            imageUrl: product.productImages[0]?.getDirectURL()
        });
        toast.success('Added to cart!');
    };

    return (
        <div className="container py-12">
            <div className="mb-8">
                <img
                    src="/assets/generated/product-showcase.dim_800x600.png"
                    alt="Product showcase"
                    className="w-full h-64 object-cover rounded-2xl shadow-artistic-lg"
                />
            </div>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Art Store</h1>
                    <p className="text-xl text-muted-foreground">
                        Shop unique artwork and creative merchandise
                    </p>
                </div>
                {identity && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Add New Product</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-title">Product Title *</Label>
                                    <Input
                                        id="product-title"
                                        placeholder="e.g., Abstract Canvas Print"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-description">Description *</Label>
                                    <Textarea
                                        id="product-description"
                                        placeholder="Describe your product..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-price">Price (USD) *</Label>
                                    <Input
                                        id="product-price"
                                        type="number"
                                        placeholder="29.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-image">Product Image *</Label>
                                    <Input
                                        id="product-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadProgress !== null}
                                    />
                                    {uploadProgress !== null && (
                                        <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                                    )}
                                </div>
                                <Button onClick={handleCreate} disabled={createProduct.isPending} className="w-full">
                                    {createProduct.isPending ? 'Creating...' : 'Create Product'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div className="gallery-grid">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="h-64 w-full rounded-t-lg" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products && products.length > 0 ? (
                <div className="gallery-grid">
                    {products.map((product) => (
                        <Card
                            key={product.id}
                            className="group hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                                {product.productImages.length > 0 ? (
                                    <img
                                        src={product.productImages[0].getDirectURL()}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Store className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle className="font-display text-xl">{product.title}</CardTitle>
                                <p className="text-2xl font-bold text-primary">${Number(product.price) / 100}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" className="flex-1">
                                        <Link to="/store/$id" params={{ id: product.id }}>
                                            View
                                        </Link>
                                    </Button>
                                    <Button onClick={() => handleAddToCart(product)} className="flex-1">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Products Yet</h3>
                    <p className="text-muted-foreground">Be the first to list a product!</p>
                </Card>
            )}
        </div>
    );
}
