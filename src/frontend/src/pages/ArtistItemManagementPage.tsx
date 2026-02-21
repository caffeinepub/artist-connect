import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProductsByArtist, useGetMusicByArtist, useGetAllGigs, useGetArtistRevenue, useDeleteProduct, useDeleteMusic, useDeleteGig } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ArtistItemManagementPage() {
  const { identity } = useInternetIdentity();
  const artistPrincipal = identity?.getPrincipal();
  const artistId = artistPrincipal?.toString() || '';

  const { data: products = [], isLoading: productsLoading } = useGetProductsByArtist(artistPrincipal!);
  const { data: music = [], isLoading: musicLoading } = useGetMusicByArtist(artistPrincipal!);
  const { data: allGigs = [], isLoading: gigsLoading } = useGetAllGigs();
  const { data: revenue, isLoading: revenueLoading } = useGetArtistRevenue(artistId);

  const deleteProduct = useDeleteProduct();
  const deleteMusic = useDeleteMusic();
  const deleteGig = useDeleteGig();

  const gigs = allGigs.filter((gig) => gig.artistId.toString() === artistPrincipal?.toString());

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteMusic = async (id: string) => {
    try {
      await deleteMusic.mutateAsync(id);
      toast.success('Music track deleted successfully');
    } catch (error) {
      console.error('Error deleting music:', error);
      toast.error('Failed to delete music track');
    }
  };

  const handleDeleteGig = async (id: string) => {
    try {
      await deleteGig.mutateAsync(id);
      toast.success('Gig deleted successfully');
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast.error('Failed to delete gig');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to manage your items</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (productsLoading || musicLoading || gigsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Items</h1>
        <p className="text-muted-foreground">Manage your products, music, and gigs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(Number(revenue?.totalRevenue || 0) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Music & Gigs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{music.length + gigs.length}</div>
            <p className="text-xs text-muted-foreground">Total listings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="music">Music ({music.length})</TabsTrigger>
          <TabsTrigger value="gigs">Gigs ({gigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No products yet. Create your first product to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  {product.productImages[0] && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img src={product.productImages[0].getDirectURL()} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">${(Number(product.price) / 100).toFixed(2)}</Badge>
                      {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          {music.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No music tracks yet. Upload your first track to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {music.map((track) => (
                <Card key={track.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{track.title}</CardTitle>
                    <CardDescription>{track.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">${(Number(track.price) / 100).toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{track.description}</p>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Music Track</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{track.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMusic(track.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gigs" className="space-y-4">
          {gigs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No gigs yet. Create your first gig to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gigs.map((gig) => (
                <Card key={gig.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{gig.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">${(Number(gig.pricing) / 100).toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{gig.description}</p>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{gig.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGig(gig.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
