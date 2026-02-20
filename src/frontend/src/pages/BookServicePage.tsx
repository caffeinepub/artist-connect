import { useParams, Link } from '@tanstack/react-router';
import { useGetArtistById, useGetServicesByArtist } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

export default function BookServicePage() {
    const { artistId } = useParams({ from: '/book/$artistId' });
    const { data: artist, isLoading: artistLoading } = useGetArtistById(artistId);
    const { data: services, isLoading: servicesLoading } = useGetServicesByArtist(artistId);

    if (artistLoading || servicesLoading) {
        return (
            <div className="container py-12">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="grid lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center">
                    <h2 className="font-display text-3xl font-bold mb-4">Artist Not Found</h2>
                    <Button asChild>
                        <Link to="/artists">Browse Artists</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <Button asChild variant="ghost" className="mb-6">
                <Link to="/artists/$id" params={{ id: artistId }}>
                    ← Back to Profile
                </Link>
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <h1 className="font-display text-4xl font-bold mb-4">Book a Service</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">Artist Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{artist.bio}</p>
                            <p className="text-sm text-muted-foreground">Contact: {artist.contactInfo}</p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="font-display text-2xl font-bold mb-4">Available Services</h2>
                    {services && services.length > 0 ? (
                        <div className="space-y-4">
                            {services.map((service) => (
                                <Card key={service.id.toString()} className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{service.name}</CardTitle>
                                            <span className="text-primary font-bold">${Number(service.price) / 100}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Duration: {Number(service.duration)} minutes
                                        </p>
                                        <Button className="w-full">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Select Date & Time
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">No services available at this time</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
