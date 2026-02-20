import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { validateImageBatch } from '../utils/fileValidation';
import { ExternalBlob } from '../backend';
import { useCreateProduct } from '../hooks/useQueries';
import { toast } from 'sonner';

interface PendingProduct {
  id: string;
  file: File;
  preview: string;
  name: string;
  description: string;
  price: string;
}

interface BatchProductUploadProps {
  onComplete: () => void;
}

export default function BatchProductUpload({ onComplete }: BatchProductUploadProps) {
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createProduct = useCreateProduct();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { valid, invalid } = validateImageBatch(files);

    if (invalid.length > 0) {
      invalid.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`);
      });
    }

    const newProducts: PendingProduct[] = valid.map(({ file }, index) => {
      // Generate default name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const formattedName = nameWithoutExt
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        name: formattedName || `Product ${pendingProducts.length + index + 1}`,
        description: 'Add product description here',
        price: '10.00',
      };
    });

    setPendingProducts((prev) => [...prev, ...newProducts]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveProduct = (id: string) => {
    setPendingProducts((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const updateProductField = (id: string, field: keyof PendingProduct, value: string) => {
    setPendingProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateAll = async () => {
    if (pendingProducts.length === 0 || isCreating) return;

    // Validate all products
    const invalidProducts = pendingProducts.filter(
      (item) => !item.name.trim() || !item.description.trim() || parseFloat(item.price) <= 0
    );

    if (invalidProducts.length > 0) {
      toast.error(`Please fill in all fields for ${invalidProducts[0].name}`);
      return;
    }

    setIsCreating(true);
    setCurrentProgress({ current: 0, total: pendingProducts.length });

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < pendingProducts.length; i++) {
      const product = pendingProducts[i];
      setCurrentProgress({ current: i + 1, total: pendingProducts.length });

      try {
        // Convert file to bytes
        const arrayBuffer = await product.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Create ExternalBlob with upload progress tracking
        let uploadProgress = 0;
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          uploadProgress = percentage;
        });

        // Generate unique product ID
        const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create product
        await createProduct.mutateAsync({
          id: productId,
          title: product.name.trim(),
          description: product.description.trim(),
          price: BigInt(Math.round(parseFloat(product.price) * 100)),
          productImages: [blob],
          subcategory: '',
        });

        toast.success(`Product created: ${product.name}`);
        successCount++;
      } catch (error: any) {
        console.error(`Failed to create ${product.name}:`, error);
        toast.error(`Failed to create ${product.name}: ${error.message || 'Unknown error'}`);
        failureCount++;
      }
    }

    // Show final summary
    toast.success(`Batch upload complete: ${successCount} products created, ${failureCount} failed`);

    // Clean up
    pendingProducts.forEach((product) => {
      URL.revokeObjectURL(product.preview);
    });
    setPendingProducts([]);
    setIsCreating(false);
    setCurrentProgress({ current: 0, total: 0 });

    // Close dialog and refresh
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCreating}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Images
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {pendingProducts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {pendingProducts.length} product{pendingProducts.length !== 1 ? 's' : ''} ready to create
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      {isCreating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Creating products...</span>
            <span>
              {currentProgress.current} / {currentProgress.total}
            </span>
          </div>
          <Progress value={(currentProgress.current / currentProgress.total) * 100} />
        </div>
      )}

      {/* Product List */}
      {pendingProducts.length > 0 && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {pendingProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={product.preview}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor={`name-${product.id}`} className="text-xs">
                        Product Name *
                      </Label>
                      <Input
                        id={`name-${product.id}`}
                        value={product.name}
                        onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                        disabled={isCreating}
                        placeholder="Product name"
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`description-${product.id}`} className="text-xs">
                        Description *
                      </Label>
                      <Textarea
                        id={`description-${product.id}`}
                        value={product.description}
                        onChange={(e) =>
                          updateProductField(product.id, 'description', e.target.value)
                        }
                        disabled={isCreating}
                        placeholder="Product description"
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`price-${product.id}`} className="text-xs">
                          Price (USD) *
                        </Label>
                        <Input
                          id={`price-${product.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.price}
                          onChange={(e) => updateProductField(product.id, 'price', e.target.value)}
                          disabled={isCreating}
                          placeholder="0.00"
                          className="h-8"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        disabled={isCreating}
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {pendingProducts.length > 0 && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onComplete} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateAll} disabled={isCreating || pendingProducts.length === 0}>
            {isCreating ? 'Creating...' : `Create All Products (${pendingProducts.length})`}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {pendingProducts.length === 0 && !isCreating && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No images selected</p>
          <p className="text-sm text-muted-foreground">
            Click "Select Images" to choose multiple product images
          </p>
        </div>
      )}
    </div>
  );
}
