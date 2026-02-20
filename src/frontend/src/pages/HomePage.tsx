import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Briefcase, Sparkles, Calendar, Store, ArrowRight } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background">
                <div className="container py-20 md:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 animate-fade-in">
                            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Where Artists & Opportunities{' '}
                                <span className="text-primary">Connect</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-xl">
                                Discover talented artists, find creative gigs, book services, and shop unique artwork
                                all in one vibrant marketplace.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button asChild size="lg" className="text-lg">
                                    <Link to="/artists">
                                        Explore Artists <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="text-lg">
                                    <Link to="/store">Browse Store</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="/assets/generated/hero-banner.dim_1920x600.png"
                                alt="Artist workspace with creative tools"
                                className="rounded-2xl shadow-artistic-lg w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container py-20">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        Everything Artists Need
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive platform designed to support and empower the creative community
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Palette className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Artist Profiles</h3>
                            <p className="text-muted-foreground mb-4">
                                Showcase your portfolio, skills, and creative journey with beautiful profile pages
                            </p>
                            <Button asChild variant="link" className="p-0">
                                <Link to="/artists">
                                    Browse Artists <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-accent/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Briefcase className="h-7 w-7 text-accent" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Job Marketplace</h3>
                            <p className="text-muted-foreground mb-4">
                                Find creative opportunities and connect with clients looking for artistic talent
                            </p>
                            <Button asChild variant="link" className="p-0">
                                <Link to="/jobs">
                                    View Jobs <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-chart-2/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Sparkles className="h-7 w-7 text-chart-2" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Gig Services</h3>
                            <p className="text-muted-foreground mb-4">
                                Offer your creative services and get hired for exciting projects
                            </p>
                            <Button asChild variant="link" className="p-0">
                                <Link to="/gigs">
                                    Explore Gigs <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-chart-3/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Calendar className="h-7 w-7 text-chart-3" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Easy Booking</h3>
                            <p className="text-muted-foreground mb-4">
                                Schedule sessions with artists and manage your bookings seamlessly
                            </p>
                            <Button asChild variant="link" className="p-0">
                                <Link to="/bookings">
                                    Manage Bookings <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-chart-4/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Store className="h-7 w-7 text-chart-4" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Art Store</h3>
                            <p className="text-muted-foreground mb-4">
                                Shop unique artwork, prints, and creative merchandise from talented artists
                            </p>
                            <Button asChild variant="link" className="p-0">
                                <Link to="/store">
                                    Visit Store <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-artistic">
                        <CardContent className="pt-6">
                            <div className="rounded-full bg-chart-5/10 w-14 h-14 flex items-center justify-center mb-4">
                                <Sparkles className="h-7 w-7 text-chart-5" />
                            </div>
                            <h3 className="font-display text-2xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-muted-foreground mb-4">
                                Safe and secure payment processing powered by Stripe for all transactions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
                <div className="container text-center">
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                        Ready to Join Our Creative Community?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Whether you're an artist looking to showcase your work or someone seeking creative talent,
                        Artist Connect is your gateway to endless possibilities.
                    </p>
                    <Button asChild size="lg" className="text-lg">
                        <Link to="/my-profile">
                            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
