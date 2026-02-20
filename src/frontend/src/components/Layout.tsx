import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Palette } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { SiFacebook, SiX, SiInstagram } from 'react-icons/si';

export default function Layout() {
    const { login, clear, loginStatus, identity } = useInternetIdentity();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { getCartItemCount } = useCart();
    const cartCount = getCartItemCount();

    const isAuthenticated = !!identity;
    const disabled = loginStatus === 'logging-in';

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
            navigate({ to: '/' });
        } else {
            try {
                await login();
            } catch (error: any) {
                console.error('Login error:', error);
                if (error.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => login(), 300);
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <Palette className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
                        <span className="font-display text-2xl font-bold text-foreground">Artist Connect</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            to="/artists"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Artists
                        </Link>
                        <Link
                            to="/jobs"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Jobs
                        </Link>
                        <Link
                            to="/gigs"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Gigs
                        </Link>
                        <Link
                            to="/bookings"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Bookings
                        </Link>
                        <Link
                            to="/store"
                            className="transition-colors hover:text-primary text-foreground/80"
                        >
                            Store
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        {isAuthenticated && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate({ to: '/my-profile' })}
                                    className="relative"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate({ to: '/cart' })}
                                    className="relative"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={handleAuth}
                            disabled={disabled}
                            variant={isAuthenticated ? 'outline' : 'default'}
                            className="font-medium"
                        >
                            {disabled ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-border/40 bg-muted/30 mt-16">
                <div className="container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Palette className="h-6 w-6 text-primary" />
                                <span className="font-display text-xl font-bold">Artist Connect</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Empowering artists and connecting creative talent with opportunities worldwide.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Explore</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link to="/artists" className="hover:text-primary transition-colors">
                                        Browse Artists
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="hover:text-primary transition-colors">
                                        Job Opportunities
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/gigs" className="hover:text-primary transition-colors">
                                        Gig Marketplace
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/store" className="hover:text-primary transition-colors">
                                        Art Store
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">For Artists</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link to="/my-profile" className="hover:text-primary transition-colors">
                                        My Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/bookings" className="hover:text-primary transition-colors">
                                        Manage Bookings
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Connect</h3>
                            <div className="flex space-x-3">
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label="Facebook"
                                >
                                    <SiFacebook className="h-5 w-5" />
                                </a>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label="X (Twitter)"
                                >
                                    <SiX className="h-5 w-5" />
                                </a>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    aria-label="Instagram"
                                >
                                    <SiInstagram className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} Artist Connect. All rights reserved.</p>
                        <p className="mt-2 md:mt-0">
                            Built with ❤️ using{' '}
                            <a
                                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                                    window.location.hostname
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                caffeine.ai
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
