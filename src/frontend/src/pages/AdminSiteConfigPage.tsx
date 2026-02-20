import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, ShieldAlert, AlertCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSiteConfigPage() {
    const { identity } = useInternetIdentity();
    const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
    const [siteName, setSiteName] = useState('Artist Connect');
    const [contactEmail, setContactEmail] = useState('contact@artistconnect.com');
    const [minPrice, setMinPrice] = useState('10');
    const [commissionRate, setCommissionRate] = useState('15');
    const [isSaving, setIsSaving] = useState(false);

    const isAuthenticated = !!identity;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate save operation
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Site configuration saved successfully');
        } catch (error: any) {
            console.error('Error saving configuration:', error);
            toast.error('Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-12">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to access the admin panel.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isAdminLoading) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container py-12">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                        Access denied. You do not have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Settings className="h-6 w-6 text-primary" />
                        <CardTitle className="text-3xl font-display">Site Configuration</CardTitle>
                    </div>
                    <CardDescription>
                        Manage platform settings and marketplace rules
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Site Metadata</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        placeholder="Enter site name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="contact@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Marketplace Rules</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minPrice">Minimum Price (USD)</Label>
                                    <Input
                                        id="minPrice"
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="10"
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Minimum price for products and services
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                                    <Input
                                        id="commissionRate"
                                        type="number"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(e.target.value)}
                                        placeholder="15"
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Platform commission on transactions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Featured Content</h3>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Featured content management requires backend implementation. This feature will be available in a future update.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <Button onClick={handleSave} disabled={isSaving} size="lg">
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
