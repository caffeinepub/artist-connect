import { useParams, Link } from '@tanstack/react-router';
import { useGetArtistById, useGetServicesByArtist } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Sparkles } from 'lucide-react';

export default function ArtistProfilePage() {
    const { id } = useParams({ from: '/artists/$id' });
    const { data: artist, isLoading } = useGetArtistById(id);
    const { data: services } = useGetServicesByArtist(id);

    if (isLoading) {
        return (
            <div className="container py-12">
                <Skeleton className="h-12 w-64 mb-8" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center">
                    <h2 className="font-display text-3xl font-bold mb-4">Artist Not Found</h2>
                    <p className="text-muted-foreground mb-6">The artist profile you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link to="/artists">Browse Artists</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Artist Portfolio</h1>
                        <p className="text-xl text-muted-foreground">{artist.bio}</p>
                    </div>

                    {artist.portfolioImages.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-display">Portfolio Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {artist.portfolioImages.map((image, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square rounded-lg overflow-hidden bg-muted"
                                        >
                                            <img
                                                src={image.getDirectURL()}
                                                alt={`Portfolio ${idx + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {services && services.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-display">Available Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {services.map((service) => (
                                        <div
                                            key={service.id.toString()}
                                            className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-lg">{service.name}</h4>
                                                <span className="text-primary font-bold">
                                                    ${Number(service.price) / 100}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-2">
                                                {service.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{Number(service.duration)} minutes</span>
                                                {service.category && <Badge variant="outline">{service.category}</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">Skills & Expertise</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {artist.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-sm">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">{artist.contactInfo}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button asChild className="w-full" size="lg">
                        <Link to="/book/$artistId" params={{ artistId: id }}>
                            <Calendar className="mr-2 h-5 w-5" />
                            Book a Service
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
