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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateGig } from '../hooks/useQueries';
import type { Gig } from '../backend';

interface EditGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gig: Gig;
  onSuccess: () => void;
}

export function EditGigDialog({
  open,
  onOpenChange,
  gig,
  onSuccess,
}: EditGigDialogProps) {
  const [title, setTitle] = useState(gig.title);
  const [description, setDescription] = useState(gig.description);
  const [pricing, setPricing] = useState((Number(gig.pricing) / 100).toString());
  const [deliveryDays, setDeliveryDays] = useState('');

  const updateGig = useUpdateGig();

  useEffect(() => {
    if (open) {
      setTitle(gig.title);
      setDescription(gig.description);
      setPricing((Number(gig.pricing) / 100).toString());
      
      // Calculate delivery days from deliveryTime
      const days = Math.round(
        (Number(gig.deliveryTime) - Date.now() * 1_000_000) /
        (24 * 60 * 60 * 1_000_000_000)
      );
      setDeliveryDays(Math.max(1, days).toString());
    }
  }, [open, gig]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    const pricingValue = parseFloat(pricing);
    if (isNaN(pricingValue) || pricingValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const deliveryDaysValue = parseInt(deliveryDays);
    if (isNaN(deliveryDaysValue) || deliveryDaysValue < 1) {
      toast.error('Delivery time must be at least 1 day');
      return;
    }

    try {
      const deliveryTime = BigInt(Date.now() * 1_000_000 + deliveryDaysValue * 24 * 60 * 60 * 1_000_000_000);
      
      await updateGig.mutateAsync({
        id: gig.id,
        artistId: gig.artistId,
        title: title.trim(),
        description: description.trim(),
        pricing: BigInt(Math.round(pricingValue * 100)),
        deliveryTime,
      });
      
      toast.success('Gig updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating gig:', error);
      toast.error(error.message || 'Failed to update gig');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Gig</DialogTitle>
          <DialogDescription>
            Update your gig details, pricing, and delivery time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Custom Portrait Illustration"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you'll deliver..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricing">Price (USD) *</Label>
              <Input
                id="pricing"
                type="number"
                step="0.01"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                placeholder="50.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery (days) *</Label>
              <Input
                id="delivery"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="7"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateGig.isPending}>
            {updateGig.isPending ? (
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
