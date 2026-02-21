import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateProduct } from '../hooks/useQueries';
import type { Product } from '../backend';
import { ExternalBlob } from '../backend';
import { validateImageFile } from '../utils/fileValidation';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onSuccess: () => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: EditProductDialogProps) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState((Number(product.price) / 100).toString());
  const [subcategory, setSubcategory] = useState(product.subcategory);
  const [productImages, setProductImages] = useState<ExternalBlob[]>(product.productImages);
  const [uploadingImages, setUploadingImages] = useState(false);

  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (open) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice((Number(product.price) / 100).toString());
      setSubcategory(product.subcategory);
      setProductImages(product.productImages);
    }
  }, [open, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: ExternalBlob[] = [];

    try {
      for (const file of Array.from(files)) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newImages.push(blob);
      }

      setProductImages([...productImages, ...newImages]);
      toast.success(`${newImages.length} image(s) added`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!subcategory.trim()) {
      toast.error('Subcategory is required');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(priceValue * 100)),
        productImages,
        subcategory: subcategory.trim(),
      });
      toast.success('Product updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Product</DialogTitle>
          <DialogDescription>
            Update your product details, pricing, and images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Input
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g., cars, art, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
            {productImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {productImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.getDirectURL()}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProduct.isPending || uploadingImages}>
            {updateProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
