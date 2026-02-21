import React, { useState } from 'react';
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
import { useDonateToArtist } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artistId: string;
  artistName: string;
}

export function DonationDialog({ open, onOpenChange, artistId, artistName }: DonationDialogProps) {
  const [amount, setAmount] = useState('');
  const donateToArtist = useDonateToArtist();

  const handleDonate = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum < 1) {
      toast.error('Please enter a valid amount (minimum $1)');
      return;
    }

    const amountInCents = Math.round(amountNum * 100);
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-failure`;

    try {
      const session = await donateToArtist.mutateAsync({
        artistId,
        amount: amountInCents,
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donate to {artistName}</DialogTitle>
          <DialogDescription>
            Support this artist with a direct donation. Your contribution helps them continue creating amazing work.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                disabled={donateToArtist.isPending}
              />
            </div>
            <p className="text-sm text-muted-foreground">Minimum donation: $1.00</p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={donateToArtist.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            disabled={donateToArtist.isPending || !amount}
            className="w-full sm:w-auto"
          >
            {donateToArtist.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Donate Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
