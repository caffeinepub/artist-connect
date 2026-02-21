import { useGetAllGigs, useCreateGig, useDeleteGig } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Plus, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditGigDialog } from '../components/EditGigDialog';
import type { Gig } from '../backend';
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

export default function GigsPage() {
    const { data: gigs, isLoading, refetch } = useGetAllGigs();
    const { identity } = useInternetIdentity();
    const createGig = useCreateGig();
    const deleteGig = useDeleteGig();
    const [open, setOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGig, setSelectedGig] = useState<Gig | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [pricing, setPricing] = useState('');
    const [deliveryDays, setDeliveryDays] = useState('');

    const principalId = identity?.getPrincipal().toString();

    const handleCreate = async () => {
        if (!identity || !title.trim() || !description.trim() || !pricing || !deliveryDays) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const deliveryTime = BigInt(Date.now() * 1_000_000 + parseInt(deliveryDays) * 24 * 60 * 60 * 1_000_000_000);
            await createGig.mutateAsync({
                id: `gig-${Date.now()}`,
                artistId: identity.getPrincipal(),
                title: title.trim(),
                description: description.trim(),
                pricing: BigInt(Math.round(parseFloat(pricing) * 100)),
                deliveryTime
            });
            toast.success('Gig created successfully!');
            setOpen(false);
            setTitle('');
            setDescription('');
            setPricing('');
            setDeliveryDays('');
        } catch (error) {
            toast.error('Failed to create gig');
            console.error(error);
        }
    };

    const handleEditClick = (gig: Gig) => {
        setSelectedGig(gig);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (gig: Gig) => {
        setSelectedGig(gig);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGig) return;

        try {
            await deleteGig.mutateAsync(selectedGig.id);
            toast.success('Gig deleted successfully!');
            setDeleteDialogOpen(false);
            setSelectedGig(null);
        } catch (error: any) {
            console.error('Error deleting gig:', error);
            toast.error(error.message || 'Failed to delete gig');
        }
    };

    const handleEditSuccess = () => {
        refetch();
    };

    const isOwnGig = (gig: Gig) => {
        return principalId && gig.artistId.toString() === principalId;
    };

    return (
        <div className="container py-12">
            <div className="mb-8 text-center">
                <img
                    src="/assets/generated/gig-icon.dim_200x200.png"
                    alt="Gig marketplace"
                    className="h-24 w-24 mx-auto mb-6"
                />
            </div>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Gig Marketplace</h1>
                    <p className="text-xl text-muted-foreground">
                        Discover creative services and hire talented artists
                    </p>
                </div>
                {identity && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Create Gig
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Create a New Gig</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gig-title">Gig Title *</Label>
                                    <Input
                                        id="gig-title"
                                        placeholder="e.g., Custom Portrait Illustration"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gig-description">Description *</Label>
                                    <Textarea
                                        id="gig-description"
                                        placeholder="Describe what you'll deliver..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gig-pricing">Price (USD) *</Label>
                                        <Input
                                            id="gig-pricing"
                                            type="number"
                                            placeholder="50"
                                            value={pricing}
                                            onChange={(e) => setPricing(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="delivery">Delivery (days) *</Label>
                                        <Input
                                            id="delivery"
                                            type="number"
                                            placeholder="7"
                                            value={deliveryDays}
                                            onChange={(e) => setDeliveryDays(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCreate} disabled={createGig.isPending} className="w-full">
                                    {createGig.isPending ? 'Creating...' : 'Create Gig'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div className="gallery-grid">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : gigs && gigs.length > 0 ? (
                <div className="gallery-grid">
                    {gigs.map((gig) => (
                        <Card
                            key={gig.id}
                            className="group hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <CardHeader>
                                <CardTitle className="font-display text-xl">{gig.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground line-clamp-3">{gig.description}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-1 text-primary font-bold">
                                        <DollarSign className="h-4 w-4" />
                                        {Number(gig.pricing) / 100}
                                    </span>
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {Math.round(
                                            (Number(gig.deliveryTime) - Date.now() * 1_000_000) /
                                                (24 * 60 * 60 * 1_000_000_000)
                                        )}{' '}
                                        days
                                    </span>
                                </div>
                                {isOwnGig(gig) ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditClick(gig)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(gig)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                ) : (
                                    <Button asChild className="w-full">
                                        <Link to="/gigs/$id" params={{ id: gig.id }}>
                                            View Details
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Gigs Available</h3>
                    <p className="text-muted-foreground">Be the first to offer your creative services!</p>
                </Card>
            )}

            {selectedGig && (
                <>
                    <EditGigDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        gig={selectedGig}
                        onSuccess={handleEditSuccess}
                    />

                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{selectedGig.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}
