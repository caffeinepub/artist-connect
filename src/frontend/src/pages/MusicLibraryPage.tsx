import { useGetAllMusic, useCreateMusic, useDeleteMusic } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Music as MusicIcon, Plus, ShoppingCart, DollarSign, Edit, Trash2 } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { useCart } from '../hooks/useCart';
import { useCheckoutMusic } from '../hooks/useQueries';
import { EditMusicDialog } from '../components/EditMusicDialog';
import type { Music } from '../backend';
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

export default function MusicLibraryPage() {
    const { data: musicList, isLoading, refetch } = useGetAllMusic();
    const { identity } = useInternetIdentity();
    const createMusic = useCreateMusic();
    const deleteMusic = useDeleteMusic();
    const checkoutMusic = useCheckoutMusic();
    const { addItem } = useCart();
    const [open, setOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const principalId = identity?.getPrincipal().toString();

    const handleCreate = async () => {
        if (!identity || !title.trim() || !price || !description.trim() || !category.trim() || !audioFile) {
            toast.error('Please fill in all fields and select an audio file');
            return;
        }

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });

            await createMusic.mutateAsync({
                id: `music-${Date.now()}`,
                title: title.trim(),
                audioFileBlob: blob,
                price: BigInt(Math.round(parseFloat(price) * 100)),
                description: description.trim(),
                category: category.trim(),
            });

            toast.success('Music track uploaded successfully!');
            setOpen(false);
            setTitle('');
            setPrice('');
            setDescription('');
            setCategory('');
            setAudioFile(null);
            setUploadProgress(0);
            if (audioInputRef.current) {
                audioInputRef.current.value = '';
            }
        } catch (error) {
            toast.error('Failed to upload music track');
            console.error(error);
        }
    };

    const handleAddToCart = (music: Music) => {
        addItem({
            id: music.id,
            name: music.title,
            price: Number(music.price),
            type: 'music',
            description: music.description,
        });
        toast.success('Added to cart!');
    };

    const handleBuyNow = async (music: Music) => {
        if (!identity) {
            toast.error('Please log in to purchase music');
            return;
        }

        try {
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const session = await checkoutMusic.mutateAsync({
                musicId: music.id,
                successUrl: `${baseUrl}/payment-success`,
                cancelUrl: `${baseUrl}/payment-failure`,
            });

            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }

            window.location.href = session.url;
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to initiate checkout');
        }
    };

    const handleEditClick = (music: Music) => {
        setSelectedMusic(music);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (music: Music) => {
        setSelectedMusic(music);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedMusic) return;

        try {
            await deleteMusic.mutateAsync(selectedMusic.id);
            toast.success('Music track deleted successfully!');
            setDeleteDialogOpen(false);
            setSelectedMusic(null);
        } catch (error: any) {
            console.error('Error deleting music:', error);
            toast.error(error.message || 'Failed to delete music track');
        }
    };

    const handleEditSuccess = () => {
        refetch();
    };

    const isOwnMusic = (music: Music) => {
        return principalId && music.artist.toString() === principalId;
    };

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Music Library</h1>
                    <p className="text-xl text-muted-foreground">
                        Discover and purchase original music tracks
                    </p>
                </div>
                {identity && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Upload Music
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Upload Music Track</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="music-title">Title *</Label>
                                    <Input
                                        id="music-title"
                                        placeholder="Track name"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="music-description">Description *</Label>
                                    <Textarea
                                        id="music-description"
                                        placeholder="Describe your music..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="music-price">Price (USD) *</Label>
                                        <Input
                                            id="music-price"
                                            type="number"
                                            step="0.01"
                                            placeholder="9.99"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="music-category">Category *</Label>
                                        <Input
                                            id="music-category"
                                            placeholder="e.g., Pop, Rock"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="audio-file">Audio File *</Label>
                                    <Input
                                        ref={audioInputRef}
                                        id="audio-file"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <Button onClick={handleCreate} disabled={createMusic.isPending} className="w-full">
                                    {createMusic.isPending ? 'Uploading...' : 'Upload Music'}
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
            ) : musicList && musicList.length > 0 ? (
                <div className="gallery-grid">
                    {musicList.map((music) => (
                        <Card
                            key={music.id}
                            className="group hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MusicIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="font-display text-lg line-clamp-1">
                                            {music.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">{music.category}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">{music.description}</p>
                                <audio controls className="w-full">
                                    <source src={music.audioFileBlob.getDirectURL()} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {(Number(music.price) / 100).toFixed(2)}
                                    </span>
                                    {isOwnMusic(music) && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(music)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(music)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {!isOwnMusic(music) && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleAddToCart(music)}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => handleBuyNow(music)}
                                            disabled={checkoutMusic.isPending}
                                        >
                                            Buy Now
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <MusicIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No Music Tracks Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            {identity
                                ? 'Be the first to upload a music track!'
                                : 'Log in to upload and share your music.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {selectedMusic && (
                <>
                    <EditMusicDialog
                        music={selectedMusic}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        onSuccess={handleEditSuccess}
                    />
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Music Track</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{selectedMusic.title}"? This action cannot be
                                    undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
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
