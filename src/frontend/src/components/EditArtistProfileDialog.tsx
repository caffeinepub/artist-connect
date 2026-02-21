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
import { Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateArtistProfile } from '../hooks/useQueries';
import type { ArtistProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { validateImageFile } from '../utils/fileValidation';

interface EditArtistProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ArtistProfile;
  onSuccess: () => void;
}

export function EditArtistProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditArtistProfileDialogProps) {
  const [bio, setBio] = useState(profile.bio);
  const [contactInfo, setContactInfo] = useState(profile.contactInfo);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioImages, setPortfolioImages] = useState<ExternalBlob[]>(profile.portfolioImages);
  const [uploadingImages, setUploadingImages] = useState(false);

  const updateProfile = useUpdateArtistProfile();

  useEffect(() => {
    if (open) {
      setBio(profile.bio);
      setContactInfo(profile.contactInfo);
      setSkills(profile.skills);
      setPortfolioImages(profile.portfolioImages);
    }
  }, [open, profile]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: ExternalBlob[] = [];

    try {
      for (const file of Array.from(files)) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        newImages.push(blob);
      }

      setPortfolioImages([...portfolioImages, ...newImages]);
      toast.success(`${newImages.length} image(s) added`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bio.trim()) {
      toast.error('Bio is required');
      return;
    }

    if (!contactInfo.trim()) {
      toast.error('Contact information is required');
      return;
    }

    if (skills.length === 0) {
      toast.error('At least one skill is required');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        bio: bio.trim(),
        contactInfo: contactInfo.trim(),
        skills,
        portfolioImages,
      });
      toast.success('Profile updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Artist Profile</DialogTitle>
          <DialogDescription>
            Update your bio, skills, contact information, and portfolio images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information *</Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Skills *</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Images</Label>
            <Input
              id="portfolio"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.getDirectURL()}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProfile.isPending || uploadingImages}>
            {updateProfile.isPending ? (
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
