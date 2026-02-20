import { useGetAllMusic, useCreateMusic, useGetStoreProductConfig } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCart } from '../hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Music, Plus, ShoppingCart, Play, Pause } from 'lucide-react';
import { ExternalBlob } from '../backend';

export default function MusicLibraryPage() {
    const { data: musicItems, isLoading } = useGetAllMusic();
    const { identity } = useInternetIdentity();
    const { addItem } = useCart();
    const createMusic = useCreateMusic();
    const { data: storeConfig } = useGetStoreProductConfig();
    const [open, setOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [audioBlob, setAudioBlob] = useState<ExternalBlob | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validFormats = ['.mp3', '.wav', '.flac', '.aac', '.m4a'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        if (!validFormats.includes(fileExtension)) {
            toast.error('Please select a valid audio file (MP3, WAV, FLAC, AAC, M4A)');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });
            setAudioBlob(blob);
            setUploadProgress(null);
            toast.success('Audio file ready for upload');
        } catch (error) {
            toast.error('Failed to process audio file');
            console.error(error);
            setUploadProgress(null);
        }
    };

    const handleCreate = async () => {
        if (!identity || !title.trim() || !description.trim() || !price || !category.trim() || !audioBlob) {
            toast.error('Please fill in all fields and upload an audio file');
            return;
        }

        const priceNum = parseFloat(price);
        const minPrice = storeConfig ? Number(storeConfig.pricingRules.minPrice) / 100 : 0;
        const maxPrice = storeConfig ? Number(storeConfig.pricingRules.maxPrice) / 100 : 10000;

        if (priceNum < minPrice || priceNum > maxPrice) {
            toast.error(`Price must be between $${minPrice} and $${maxPrice}`);
            return;
        }

        try {
            await createMusic.mutateAsync({
                id: `music-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title.trim(),
                audioFileBlob: audioBlob,
                price: BigInt(Math.round(priceNum * 100)),
                description: description.trim(),
                category: category.trim()
            });
            toast.success('Music uploaded successfully!');
            setOpen(false);
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setAudioBlob(null);
        } catch (error) {
            toast.error('Failed to upload music');
            console.error(error);
        }
    };

    const handleAddToCart = (music: any) => {
        addItem({
            type: 'music',
            id: music.id,
            name: music.title,
            description: music.description,
            price: Number(music.price) / 100,
            artist: music.artist.toString()
        });
        toast.success('Added to cart!');
    };

    const togglePlay = (musicId: string, audioUrl: string) => {
        const audio = audioRefs.current[musicId];
        
        if (playingId === musicId && audio) {
            audio.pause();
            setPlayingId(null);
        } else {
            // Pause all other audio
            Object.entries(audioRefs.current).forEach(([id, audioEl]) => {
                if (id !== musicId && audioEl) {
                    audioEl.pause();
                }
            });

            if (!audio) {
                const newAudio = new Audio(audioUrl);
                audioRefs.current[musicId] = newAudio;
                newAudio.play();
                newAudio.onended = () => setPlayingId(null);
            } else {
                audio.play();
            }
            setPlayingId(musicId);
        }
    };

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Music Library</h1>
                    <p className="text-xl text-muted-foreground">
                        Discover and purchase original music from talented artists
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
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Upload Music</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="music-title">Title *</Label>
                                    <Input
                                        id="music-title"
                                        placeholder="e.g., Summer Vibes"
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
                                <div className="space-y-2">
                                    <Label htmlFor="music-category">Category *</Label>
                                    {storeConfig && storeConfig.productCategories.length > 0 ? (
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
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
                                            id="music-category"
                                            placeholder="e.g., Electronic, Jazz, Rock"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    )}
                                </div>
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
                                    {storeConfig && (
                                        <p className="text-xs text-muted-foreground">
                                            Min: ${Number(storeConfig.pricingRules.minPrice) / 100} - Max: ${Number(storeConfig.pricingRules.maxPrice) / 100}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="music-file">Audio File * (MP3, WAV, FLAC, AAC, M4A - Max 50MB)</Label>
                                    <Input
                                        id="music-file"
                                        type="file"
                                        accept=".mp3,.wav,.flac,.aac,.m4a"
                                        onChange={handleAudioUpload}
                                        disabled={uploadProgress !== null}
                                    />
                                    {uploadProgress !== null && (
                                        <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                                    )}
                                </div>
                                <Button onClick={handleCreate} disabled={createMusic.isPending} className="w-full">
                                    {createMusic.isPending ? 'Uploading...' : 'Upload Music'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full mb-2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : musicItems && musicItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {musicItems.map((music) => (
                        <Card
                            key={music.id}
                            className="group hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="font-display text-xl mb-2">{music.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Artist: {music.artist.toString().slice(0, 8)}...
                                        </p>
                                        <p className="text-sm text-muted-foreground">Category: {music.category}</p>
                                    </div>
                                    <Music className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-2xl font-bold text-primary">${Number(music.price) / 100}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">{music.description}</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => togglePlay(music.id, music.audioFileBlob.getDirectURL())}
                                    >
                                        {playingId === music.id ? (
                                            <>
                                                <Pause className="mr-2 h-4 w-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Preview
                                            </>
                                        )}
                                    </Button>
                                    <Button onClick={() => handleAddToCart(music)} className="flex-1">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Buy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Music Yet</h3>
                    <p className="text-muted-foreground">Be the first to upload music!</p>
                </Card>
            )}
        </div>
    );
}
