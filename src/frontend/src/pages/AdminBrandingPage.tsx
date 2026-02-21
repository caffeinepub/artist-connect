import React, { useState } from 'react';
import { useGetSiteBranding, useUpdateSiteBranding, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

export default function AdminBrandingPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: branding, isLoading: brandingLoading } = useGetSiteBranding();
  const updateBranding = useUpdateSiteBranding();

  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  React.useEffect(() => {
    if (branding) {
      setSiteName(branding.siteName);
      setDescription(branding.description);
      setPrimaryColor(branding.primaryColor);
      setSecondaryColor(branding.secondaryColor);
      setLogoPreview(branding.logoUrl);
    }
  }, [branding]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!identity || !isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    try {
      let logoUrl = branding?.logoUrl || '';

      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array);
        logoUrl = blob.getDirectURL();
      }

      await updateBranding.mutateAsync({
        siteName,
        description,
        primaryColor,
        secondaryColor,
        logoUrl,
      });

      toast.success('Branding updated successfully');
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error('Failed to update branding');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access admin branding settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAdminLoading || brandingLoading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Site Branding</h1>
          <p className="text-muted-foreground">Configure your platform's visual identity and branding</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branding Configuration</CardTitle>
            <CardDescription>Customize your site's name, logo, and color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Label htmlFor="description">Site Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Site Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-24 h-24 border rounded-lg overflow-hidden bg-muted">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a logo image (PNG, JPG, or SVG)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={updateBranding.isPending}
                className="w-full"
              >
                {updateBranding.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Branding
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
