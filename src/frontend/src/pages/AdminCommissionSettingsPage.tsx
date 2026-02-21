import React, { useState, useEffect } from 'react';
import { useGetStoreProductConfig, useSetPlatformCommissionRate, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommissionSettingsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: storeConfig, isLoading: configLoading } = useGetStoreProductConfig();
  const setCommissionRate = useSetPlatformCommissionRate();

  const [commissionPercentage, setCommissionPercentage] = useState(10);

  useEffect(() => {
    if (storeConfig) {
      const artistShare = Number(storeConfig.artistRevenueSharePercentage);
      const commission = 100 - artistShare;
      setCommissionPercentage(commission);
    }
  }, [storeConfig]);

  const handleSave = async () => {
    if (!identity || !isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      toast.error('Commission rate must be between 0% and 100%');
      return;
    }

    try {
      await setCommissionRate.mutateAsync(commissionPercentage);
      toast.success('Commission rate updated successfully');
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('Failed to update commission rate');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access commission settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAdminLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const artistShare = 100 - commissionPercentage;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Commission Settings</h1>
          <p className="text-muted-foreground">Configure platform commission rate for all transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Commission Rate</CardTitle>
            <CardDescription>Set the percentage of each transaction that goes to the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Changes to the commission rate will apply to new transactions immediately. Historical transactions will retain their original commission rate.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="commission">Commission Percentage</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                  className="max-w-xs"
                />
                <span className="text-2xl font-bold">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform commission: {commissionPercentage}% | Artist share: {artistShare}%
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Example Calculation</h4>
              <div className="text-sm space-y-1">
                <p>Transaction amount: $100.00</p>
                <p className="text-blue-600">Platform commission ({commissionPercentage}%): ${(100 * commissionPercentage / 100).toFixed(2)}</p>
                <p className="text-green-600">Artist receives ({artistShare}%): ${(100 * artistShare / 100).toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={setCommissionRate.isPending}
                className="w-full"
              >
                {setCommissionRate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Commission Rate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
