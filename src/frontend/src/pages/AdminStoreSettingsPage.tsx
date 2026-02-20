import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetStoreProductConfig, useUpdateStoreProductConfig, useSetRequireApprovalFor } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, ShieldAlert, AlertCircle, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminStoreSettingsPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
    const { data: storeConfig, isLoading: configLoading } = useGetStoreProductConfig();
    const updateConfig = useUpdateStoreProductConfig();
    const updateApproval = useSetRequireApprovalFor();

    const [lowStockThreshold, setLowStockThreshold] = useState('10');
    const [freeShippingThreshold, setFreeShippingThreshold] = useState('5000');
    const [taxRate, setTaxRate] = useState('7');
    const [categoryLimit, setCategoryLimit] = useState('10');
    const [returnPeriodDays, setReturnPeriodDays] = useState('30');
    const [requireApprovalJobs, setRequireApprovalJobs] = useState(true);
    const [requireApprovalProducts, setRequireApprovalProducts] = useState(true);
    const [requireApprovalGigs, setRequireApprovalGigs] = useState(false);

    // New fields for product configuration
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('10000');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
    const [newFeaturedProduct, setNewFeaturedProduct] = useState('');
    const [productStatuses, setProductStatuses] = useState<string[]>(['draft', 'active', 'archived']);
    const [newStatus, setNewStatus] = useState('');

    const isAuthenticated = !!identity;

    useEffect(() => {
        if (storeConfig) {
            setLowStockThreshold(storeConfig.lowStockThreshold.toString());
            setFreeShippingThreshold(storeConfig.freeShippingThreshold.toString());
            setTaxRate(storeConfig.taxRate.toString());
            setCategoryLimit(storeConfig.productCategoryLimit.toString());
            setReturnPeriodDays(storeConfig.returnPeriodDays.toString());
            setRequireApprovalJobs(storeConfig.requireApprovalFor.jobs);
            setRequireApprovalProducts(storeConfig.requireApprovalFor.products);
            setRequireApprovalGigs(storeConfig.requireApprovalFor.gigs);
            
            // Load new fields
            setMinPrice(storeConfig.pricingRules.minPrice.toString());
            setMaxPrice(storeConfig.pricingRules.maxPrice.toString());
            setCategories(storeConfig.productCategories);
            setTags(storeConfig.productTags);
            setFeaturedProducts(storeConfig.featuredProducts);
            setProductStatuses(storeConfig.productStatuses);
        }
    }, [storeConfig]);

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleAddFeaturedProduct = () => {
        if (newFeaturedProduct.trim() && !featuredProducts.includes(newFeaturedProduct.trim())) {
            setFeaturedProducts([...featuredProducts, newFeaturedProduct.trim()]);
            setNewFeaturedProduct('');
        }
    };

    const handleRemoveFeaturedProduct = (productId: string) => {
        setFeaturedProducts(featuredProducts.filter(p => p !== productId));
    };

    const handleAddStatus = () => {
        if (newStatus.trim() && !productStatuses.includes(newStatus.trim())) {
            setProductStatuses([...productStatuses, newStatus.trim()]);
            setNewStatus('');
        }
    };

    const handleRemoveStatus = (status: string) => {
        setProductStatuses(productStatuses.filter(s => s !== status));
    };

    const handleSave = async () => {
        try {
            // Validate inputs
            const threshold = parseInt(lowStockThreshold);
            const shipping = parseInt(freeShippingThreshold);
            const tax = parseInt(taxRate);
            const categoriesLimit = parseInt(categoryLimit);
            const returnDays = parseInt(returnPeriodDays);
            const minPriceValue = parseInt(minPrice);
            const maxPriceValue = parseInt(maxPrice);

            if (isNaN(threshold) || threshold < 0) {
                toast.error('Low stock threshold must be a positive number');
                return;
            }
            if (isNaN(shipping) || shipping < 0) {
                toast.error('Free shipping threshold must be a positive number');
                return;
            }
            if (isNaN(tax) || tax < 0 || tax > 100) {
                toast.error('Tax rate must be between 0 and 100');
                return;
            }
            if (isNaN(categoriesLimit) || categoriesLimit < 1) {
                toast.error('Category limit must be at least 1');
                return;
            }
            if (isNaN(returnDays) || returnDays < 0) {
                toast.error('Return period must be a positive number');
                return;
            }
            if (isNaN(minPriceValue) || minPriceValue < 0) {
                toast.error('Minimum price must be a positive number');
                return;
            }
            if (isNaN(maxPriceValue) || maxPriceValue < 0) {
                toast.error('Maximum price must be a positive number');
                return;
            }
            if (minPriceValue >= maxPriceValue) {
                toast.error('Minimum price must be less than maximum price');
                return;
            }

            // Update store configuration
            await updateConfig.mutateAsync({
                inventoryThreshold: BigInt(threshold),
                freeShippingAmount: BigInt(shipping),
                taxRate: BigInt(tax),
                categoryLimit: BigInt(categoriesLimit),
                returnDays: BigInt(returnDays),
                pricingRules: {
                    minPrice: BigInt(minPriceValue),
                    maxPrice: BigInt(maxPriceValue)
                },
                productCategories: categories,
                productTags: tags,
                featuredProducts: featuredProducts,
                productStatuses: productStatuses
            });

            // Update approval settings
            await updateApproval.mutateAsync({
                jobs: requireApprovalJobs,
                products: requireApprovalProducts,
                gigs: requireApprovalGigs,
            });

            toast.success('Store settings saved successfully');
        } catch (error: any) {
            console.error('Error saving store settings:', error);
            toast.error(error.message || 'Failed to save store settings');
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

    if (isAdminLoading || configLoading) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                        <Store className="h-6 w-6 text-primary" />
                        <CardTitle className="text-3xl font-display">Store Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure store-wide settings and product management rules
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                    <Input
                                        id="lowStockThreshold"
                                        type="number"
                                        value={lowStockThreshold}
                                        onChange={(e) => setLowStockThreshold(e.target.value)}
                                        placeholder="10"
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Alert when inventory falls below this number
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Pricing Rules</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minPrice">Minimum Price</Label>
                                        <Input
                                            id="minPrice"
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxPrice">Maximum Price</Label>
                                        <Input
                                            id="maxPrice"
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="10000"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Set price range limits for products
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Shipping & Tax</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                                    <Input
                                        id="freeShippingThreshold"
                                        type="number"
                                        value={freeShippingThreshold}
                                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                        placeholder="5000"
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Minimum order value for free shipping (in cents)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        placeholder="7"
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Default tax rate for products
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Add new category"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                    />
                                    <Button onClick={handleAddCategory} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <Badge key={category} variant="secondary" className="gap-1">
                                            {category}
                                            <button
                                                onClick={() => handleRemoveCategory(category)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoryLimit">Category Limit</Label>
                                    <Input
                                        id="categoryLimit"
                                        type="number"
                                        value={categoryLimit}
                                        onChange={(e) => setCategoryLimit(e.target.value)}
                                        placeholder="10"
                                        min="1"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Maximum number of categories per product
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Product Tags</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add new tag"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    />
                                    <Button onClick={handleAddTag} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="gap-1">
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newFeaturedProduct}
                                        onChange={(e) => setNewFeaturedProduct(e.target.value)}
                                        placeholder="Add product ID"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeaturedProduct()}
                                    />
                                    <Button onClick={handleAddFeaturedProduct} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {featuredProducts.map((productId) => (
                                        <Badge key={productId} className="gap-1">
                                            {productId}
                                            <button
                                                onClick={() => handleRemoveFeaturedProduct(productId)}
                                                className="ml-1 hover:text-destructive-foreground"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Manage which products appear as featured
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Product Status Workflow</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        placeholder="Add new status"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                                    />
                                    <Button onClick={handleAddStatus} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {productStatuses.map((status) => (
                                        <Badge key={status} variant="secondary" className="gap-1">
                                            {status}
                                            <button
                                                onClick={() => handleRemoveStatus(status)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Define available product statuses (e.g., draft, pending, approved, rejected)
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Return Policy</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="returnPeriodDays">Return Period (Days)</Label>
                                    <Input
                                        id="returnPeriodDays"
                                        type="number"
                                        value={returnPeriodDays}
                                        onChange={(e) => setReturnPeriodDays(e.target.value)}
                                        placeholder="30"
                                        min="0"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Number of days customers can return products
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireApprovalJobs">Require Approval for Jobs</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Job postings need admin approval before going live
                                        </p>
                                    </div>
                                    <Switch
                                        id="requireApprovalJobs"
                                        checked={requireApprovalJobs}
                                        onCheckedChange={setRequireApprovalJobs}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireApprovalProducts">Require Approval for Products</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Products need admin approval before being listed
                                        </p>
                                    </div>
                                    <Switch
                                        id="requireApprovalProducts"
                                        checked={requireApprovalProducts}
                                        onCheckedChange={setRequireApprovalProducts}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="requireApprovalGigs">Require Approval for Gigs</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Gigs need admin approval before being published
                                        </p>
                                    </div>
                                    <Switch
                                        id="requireApprovalGigs"
                                        checked={requireApprovalGigs}
                                        onCheckedChange={setRequireApprovalGigs}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <Button
                            onClick={handleSave}
                            disabled={updateConfig.isPending || updateApproval.isPending}
                            size="lg"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateConfig.isPending || updateApproval.isPending ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
