import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { X, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { validateImageBatch } from '../utils/fileValidation';
import { ExternalBlob } from '../backend';
import { useGetStoreProductConfig } from '../hooks/useQueries';

export interface ImageUploadItem {
  file: File;
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  blob?: ExternalBlob;
  category: string;
  subcategory: string;
  price: number;
  description: string;
}

interface BulkImageUploadProps {
  onUploadComplete: (items: ImageUploadItem[]) => void;
  onUploadStart?: () => void;
  disabled?: boolean;
}

export default function BulkImageUpload({ onUploadComplete, onUploadStart, disabled }: BulkImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<ImageUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: storeConfig } = useGetStoreProductConfig();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { valid, invalid } = validateImageBatch(files);

    if (invalid.length > 0) {
      invalid.forEach(({ file, error }) => {
        console.error(`${file.name}: ${error}`);
      });
    }

    const defaultCategory = storeConfig?.productCategories[0] || '';
    const defaultPrice = storeConfig ? Number(storeConfig.pricingRules.minPrice) / 100 : 0;

    const newItems: ImageUploadItem[] = valid.map(({ file }) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
      category: defaultCategory,
      subcategory: '',
      price: defaultPrice,
      description: ''
    }));

    setSelectedFiles(prev => [...prev, ...newItems]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const updateItemMetadata = (id: string, field: keyof ImageUploadItem, value: any) => {
    setSelectedFiles(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    // Validate all items have required metadata
    const invalidItems = selectedFiles.filter(item => 
      !item.category || !item.subcategory || item.price <= 0 || !item.description.trim()
    );

    if (invalidItems.length > 0) {
      const firstInvalid = invalidItems[0];
      alert(`Please fill in all fields for ${firstInvalid.file.name}`);
      return;
    }

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    const updatedFiles = [...selectedFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      
      try {
        updatedFiles[i] = { ...item, status: 'uploading' };
        setSelectedFiles([...updatedFiles]);

        const arrayBuffer = await item.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          updatedFiles[i] = { ...updatedFiles[i], progress: percentage };
          setSelectedFiles([...updatedFiles]);
        });

        updatedFiles[i] = {
          ...updatedFiles[i],
          status: 'success',
          progress: 100,
          blob
        };
        setSelectedFiles([...updatedFiles]);
      } catch (error) {
        updatedFiles[i] = {
          ...updatedFiles[i],
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        };
        setSelectedFiles([...updatedFiles]);
      }
    }

    setIsUploading(false);
    onUploadComplete(updatedFiles);
  };

  const minPrice = storeConfig ? Number(storeConfig.pricingRules.minPrice) / 100 : 0;
  const maxPrice = storeConfig ? Number(storeConfig.pricingRules.maxPrice) / 100 : 10000;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="flex-1"
        />
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={disabled || isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
          </Button>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {selectedFiles.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {item.status === 'success' && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(item.id)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Category *</Label>
                        {storeConfig && storeConfig.productCategories.length > 0 ? (
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateItemMetadata(item.id, 'category', value)}
                            disabled={isUploading}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {storeConfig.productCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={item.category}
                            onChange={(e) => updateItemMetadata(item.id, 'category', e.target.value)}
                            placeholder="Category"
                            disabled={isUploading}
                            className="h-8 text-xs"
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Subcategory *</Label>
                        <Input
                          value={item.subcategory}
                          onChange={(e) => updateItemMetadata(item.id, 'subcategory', e.target.value)}
                          placeholder="Subcategory"
                          disabled={isUploading}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Price (${minPrice}-${maxPrice}) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={minPrice}
                          max={maxPrice}
                          value={item.price}
                          onChange={(e) => updateItemMetadata(item.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          disabled={isUploading}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Description *</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItemMetadata(item.id, 'description', e.target.value)}
                          placeholder="Product description"
                          disabled={isUploading}
                          className="text-xs min-h-[60px]"
                          rows={2}
                        />
                      </div>
                    </div>

                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className="h-2" />
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-red-500">{item.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
