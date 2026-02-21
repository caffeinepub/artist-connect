import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetArtistById, useGetArtistRevenue } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Mail, Heart, Edit } from 'lucide-react';
import { DonationDialog } from '../components/DonationDialog';
import { EditArtistProfileDialog } from '../components/EditArtistProfileDialog';

export default function ArtistProfilePage() {
  const { id } = useParams({ from: '/artists/$id' });
  const navigate = useNavigate();
  const { data: artist, isLoading: artistLoading, refetch } = useGetArtistById(id);
  const { data: artistRevenue } = useGetArtistRevenue(id);
  const { identity } = useInternetIdentity();
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isOwnProfile = identity?.getPrincipal().toString() === id;

  const handleEditSuccess = () => {
    refetch();
  };

  if (artistLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artist Not Found</h1>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">Artist Profile</CardTitle>
                  <CardDescription>ID: {artist.id}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {isOwnProfile && (
                    <Button onClick={() => setEditDialogOpen(true)} variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                  {!isOwnProfile && identity && (
                    <Button onClick={() => setDonationDialogOpen(true)} variant="default">
                      <Heart className="mr-2 h-4 w-4" />
                      Donate
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{artist.bio}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{artist.contactInfo}</span>
                </div>
              </div>

              {isOwnProfile && artistRevenue && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-4">Revenue Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          ${(Number(artistRevenue.totalRevenue) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Pending</p>
                        <p className="text-2xl font-bold">
                          ${(Number(artistRevenue.pendingRevenue) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Paid Out</p>
                        <p className="text-2xl font-bold">
                          ${(Number(artistRevenue.paidRevenue) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {artist.portfolioImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No portfolio images yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {artist.portfolioImages.map((image, index) => {
                    const imageUrl = image.getDirectURL();
                    return (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <img src={imageUrl} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DonationDialog
        open={donationDialogOpen}
        onOpenChange={setDonationDialogOpen}
        artistId={artist.id}
        artistName={artist.bio.split('\n')[0] || 'Artist'}
      />

      {isOwnProfile && (
        <EditArtistProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={artist}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
