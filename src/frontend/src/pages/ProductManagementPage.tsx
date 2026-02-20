import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllProducts, useUpdateProduct, useDeleteProduct } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Edit, Trash2, Package, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '../backend';
import { ExternalBlob } from '../backend';
import BatchProductUpload from '../components/BatchProductUpload';

export default function ProductManagementPage() {
    const { identity } = useInternetIdentity();
    const { data: allProducts, isLoading } = useGetAllProducts();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchUploadDialogOpen, setBatchUploadDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editSubcategory, setEditSubcategory] = useState('');

    const isAuthenticated = !!identity;
    const principalId = identity?.getPrincipal().toString() || '';

    // Filter products to show only those owned by current user
    const userProducts = allProducts?.filter(
        (product) => product.artistId.toString() === principalId
    ) || [];

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setEditTitle(product.title);
        setEditDescription(product.description);
        setEditPrice((Number(product.price) / 100).toString());
        setEditSubcategory(product.subcategory);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedProduct) return;

        if (!editTitle.trim() || !editDescription.trim() || !editSubcategory.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const priceValue = parseFloat(editPrice);
        if (isNaN(priceValue) || priceValue < 0) {
            toast.error('Please enter a valid price');
            return;
        }

        try {
            await updateProduct.mutateAsync({
                id: selectedProduct.id,
                title: editTitle.trim(),
                description: editDescription.trim(),
                price: BigInt(Math.round(priceValue * 100)),
                productImages: selectedProduct.productImages,
                subcategory: editSubcategory.trim(),
            });
            toast.success('Product updated successfully!');
            setEditDialogOpen(false);
            setSelectedProduct(null);
        } catch (error: any) {
            console.error('Error updating product:', error);
            toast.error(error.message || 'Failed to update product');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;

        try {
            await deleteProduct.mutateAsync(selectedProduct.id);
            toast.success('Product deleted successfully!');
            setDeleteDialogOpen(false);
            setSelectedProduct(null);
        } catch (error: any) {
            console.error('Error deleting product:', error);
            toast.error(error.message || 'Failed to delete product');
        }
    };

    const handleBatchUploadComplete = () => {
        setBatchUploadDialogOpen(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-12">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to manage your products.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-12 max-w-6xl">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-48 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-6 w-full mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-6xl">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Product Management</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your products, update details, and track inventory
                    </p>
                </div>
                <Button onClick={() => setBatchUploadDialogOpen(true)} size="lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Batch Upload
                </Button>
            </div>

            {userProducts.length === 0 ? (
                <Card className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="font-display text-2xl font-bold mb-2">No Products Yet</h2>
                    <p className="text-muted-foreground mb-6">
                        You haven't created any products. Use the Batch Upload button to add multiple products at once.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            <CardHeader className="p-0">
                                {product.productImages.length > 0 ? (
                                    <div className="aspect-square bg-muted">
                                        <img
                                            src={product.productImages[0].getDirectURL()}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-muted flex items-center justify-center">
                                        <Package className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-4">
                                <CardTitle className="font-display text-lg mb-2 line-clamp-1">
                                    {product.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-bold text-primary">
                                        ${(Number(product.price) / 100).toFixed(2)}
                                    </span>
                                    {product.subcategory && (
                                        <span className="text-xs bg-muted px-2 py-1 rounded">
                                            {product.subcategory}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEditClick(product)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleDeleteClick(product)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Batch Upload Dialog */}
            <Dialog open={batchUploadDialogOpen} onOpenChange={setBatchUploadDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-display">Batch Product Upload</DialogTitle>
                        <DialogDescription>
                            Upload multiple product images at once. Each image will become an editable product with preset values.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        <BatchProductUpload onComplete={handleBatchUploadComplete} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-display">Edit Product</DialogTitle>
                        <DialogDescription>
                            Update your product details and pricing
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Product title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description *</Label>
                            <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Product description"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Price (USD) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-subcategory">Subcategory *</Label>
                                <Input
                                    id="edit-subcategory"
                                    value={editSubcategory}
                                    onChange={(e) => setEditSubcategory(e.target.value)}
                                    placeholder="e.g., Paintings"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={updateProduct.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={updateProduct.isPending}
                        >
                            {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            "{selectedProduct?.title}" from your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteProduct.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deleteProduct.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
