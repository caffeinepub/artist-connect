import { useGetAllArtists } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { User, ArrowRight } from 'lucide-react';

export default function ArtistsListPage() {
    const { data: artists, isLoading } = useGetAllArtists();

    return (
        <div className="container py-12">
            <div className="mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Discover Artists</h1>
                <p className="text-xl text-muted-foreground">
                    Browse talented artists and explore their creative portfolios
                </p>
            </div>

            {isLoading ? (
                <div className="gallery-grid">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : artists && artists.length > 0 ? (
                <div className="gallery-grid">
                    {artists.map((artist) => (
                        <Card
                            key={artist.id}
                            className="group hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <CardHeader>
                                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                                    {artist.portfolioImages.length > 0 ? (
                                        <img
                                            src={artist.portfolioImages[0].getDirectURL()}
                                            alt={`${artist.id} portfolio`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <img
                                            src="/assets/generated/artist-placeholder.dim_400x400.png"
                                            alt="Artist placeholder"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <CardTitle className="font-display flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Artist Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground line-clamp-3">{artist.bio}</p>
                                <div className="flex flex-wrap gap-2">
                                    {artist.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <Button asChild className="w-full">
                                    <Link to="/artists/$id" params={{ id: artist.id }}>
                                        View Profile <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Artists Yet</h3>
                    <p className="text-muted-foreground">Be the first to create an artist profile!</p>
                </Card>
            )}
        </div>
    );
}
