import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetArtistById, useCreateArtistProfile, useAddPortfolioImage } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { Upload, Loader2 } from 'lucide-react';

export default function MyProfilePage() {
    const { identity } = useInternetIdentity();
    const principalId = identity?.getPrincipal().toString() || '';
    const { data: artist, isLoading } = useGetArtistById(principalId);
    const createProfile = useCreateArtistProfile();
    const addImage = useAddPortfolioImage();

    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const handleCreateProfile = async () => {
        if (!bio.trim() || !contactInfo.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createProfile.mutateAsync({
                bio: bio.trim(),
                skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
                contactInfo: contactInfo.trim()
            });
            toast.success('Profile created successfully!');
            setBio('');
            setSkills('');
            setContactInfo('');
        } catch (error) {
            toast.error('Failed to create profile');
            console.error(error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });

            await addImage.mutateAsync(blob);
            toast.success('Image uploaded successfully!');
            setUploadProgress(null);
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
            setUploadProgress(null);
        }
    };

    if (!identity) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center">
                    <h2 className="font-display text-3xl font-bold mb-4">Login Required</h2>
                    <p className="text-muted-foreground">Please login to view and manage your profile.</p>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">My Artist Profile</h1>

            {artist ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Bio</Label>
                                <p className="text-muted-foreground mt-1">{artist.bio}</p>
                            </div>
                            <div>
                                <Label>Skills</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {artist.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>Contact</Label>
                                <p className="text-muted-foreground mt-1">{artist.contactInfo}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">Portfolio Images</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {artist.portfolioImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {artist.portfolioImages.map((image, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square rounded-lg overflow-hidden bg-muted"
                                        >
                                            <img
                                                src={image.getDirectURL()}
                                                alt={`Portfolio ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {uploadProgress !== null
                                                ? `Uploading... ${uploadProgress}%`
                                                : 'Click to upload portfolio image'}
                                        </p>
                                    </div>
                                </Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploadProgress !== null}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-display">Create Your Artist Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio *</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself and your artistic journey..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma-separated) *</Label>
                            <Input
                                id="skills"
                                placeholder="e.g., Painting, Digital Art, Illustration"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Information *</Label>
                            <Input
                                id="contact"
                                placeholder="Email or preferred contact method"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleCreateProfile}
                            disabled={createProfile.isPending}
                            className="w-full"
                        >
                            {createProfile.isPending ? 'Creating...' : 'Create Profile'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
