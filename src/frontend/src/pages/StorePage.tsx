import React, { useState } from 'react';
import { useGetAllProducts, useCheckoutProduct } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';
import BulkImageUpload from '../components/BulkImageUpload';

export default function StorePage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const { identity } = useInternetIdentity();
  const checkoutProduct = useCheckoutProduct();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkingOutProductId, setCheckingOutProductId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    subcategory: '',
  });
  const [productImages, setProductImages] = useState<File[]>([]);

  const handleBuyNow = async (productId: string) => {
    if (!identity) {
      toast.error('Please log in to make a purchase');
      return;
    }

    setCheckingOutProductId(productId);
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-failure`;

    try {
      const session = await checkoutProduct.mutateAsync({
        productId,
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
      setCheckingOutProductId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProductImages(Array.from(e.target.files));
    }
  };

  const handleCreateProduct = async () => {
    if (!identity) {
      toast.error('Please log in to create products');
      return;
    }

    if (!newProduct.title || !newProduct.description || !newProduct.price || productImages.length === 0) {
      toast.error('Please fill in all fields and upload at least one image');
      return;
    }

    toast.info('Product creation via individual form is not yet implemented. Please use bulk upload.');
    setDialogOpen(false);
  };

  const handleBulkUploadComplete = () => {
    toast.success('Products uploaded successfully!');
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Product Store</h1>
          <p className="text-muted-foreground">Browse and purchase products from talented artists</p>
        </div>
        {identity && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new product listing or upload multiple products at once</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Product</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title</Label>
                    <Input
                      id="title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      placeholder="Enter product title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={newProduct.subcategory}
                      onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                      placeholder="e.g., sedan, SUV, truck"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (in cents)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="e.g., 2999 for $29.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">Product Images</Label>
                    <Input id="images" type="file" multiple accept="image/*" onChange={handleImageChange} />
                  </div>
                  <Button onClick={handleCreateProduct} className="w-full">
                    Create Product
                  </Button>
                </TabsContent>
                <TabsContent value="bulk">
                  <BulkImageUpload onUploadComplete={handleBulkUploadComplete} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageUrl = product.productImages[0]?.getDirectURL();
            const isCheckingOut = checkingOutProductId === product.id;

            return (
              <Card key={product.id} className="overflow-hidden">
                {imageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{product.title}</CardTitle>
                  {product.subcategory && (
                    <CardDescription className="text-xs uppercase tracking-wide">{product.subcategory}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <p className="text-2xl font-bold mt-4">${(Number(product.price) / 100).toFixed(2)}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleBuyNow(product.id)}
                    disabled={!identity || isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
