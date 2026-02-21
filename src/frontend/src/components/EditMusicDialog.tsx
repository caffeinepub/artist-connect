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
import { useUpdateMusic } from '../hooks/useQueries';
import type { Music } from '../backend';

interface EditMusicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  music: Music;
  onSuccess: () => void;
}

export function EditMusicDialog({
  open,
  onOpenChange,
  music,
  onSuccess,
}: EditMusicDialogProps) {
  const [title, setTitle] = useState(music.title);
  const [price, setPrice] = useState((Number(music.price) / 100).toString());
  const [description, setDescription] = useState(music.description);
  const [category, setCategory] = useState(music.category);

  const updateMusic = useUpdateMusic();

  useEffect(() => {
    if (open) {
      setTitle(music.title);
      setPrice((Number(music.price) / 100).toString());
      setDescription(music.description);
      setCategory(music.category);
    }
  }, [open, music]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!category.trim()) {
      toast.error('Category is required');
      return;
    }

    try {
      await updateMusic.mutateAsync({
        id: music.id,
        title: title.trim(),
        price: BigInt(Math.round(priceValue * 100)),
        description: description.trim(),
        category: category.trim(),
      });
      
      toast.success('Music track updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating music:', error);
      toast.error(error.message || 'Failed to update music track');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Music Track</DialogTitle>
          <DialogDescription>
            Update your music track details and pricing. Note: Audio file cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your music track..."
              rows={3}
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
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Pop, Rock, Jazz"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMusic.isPending}>
            {updateMusic.isPending ? (
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
