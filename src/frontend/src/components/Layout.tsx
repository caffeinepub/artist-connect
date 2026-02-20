import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Settings, LayoutDashboard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';

export default function Layout() {
    const { login, clear, loginStatus, identity } = useInternetIdentity();
    const { data: isAdmin } = useIsCallerAdmin();
    const { getCartItemCount } = useCart();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const isAuthenticated = !!identity;
    const disabled = loginStatus === 'logging-in';
    const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';
    const cartItemCount = getCartItemCount();

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
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

    const navLinks = [
        { to: '/artists', label: 'Artists' },
        { to: '/jobs', label: 'Jobs' },
        { to: '/gigs', label: 'Gigs' },
        { to: '/store', label: 'Store' },
        { to: '/music', label: 'Music Library' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="font-display text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
                            ArtistConnect
                        </Link>
                        <nav className="hidden md:flex gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    activeProps={{ className: 'text-primary' }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={() => navigate({ to: '/cart' })}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>
                        {isAuthenticated && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate({ to: '/account/dashboard' })}>
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Account Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate({ to: '/my-profile' })}>
                                        My Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate({ to: '/bookings' })}>
                                        My Bookings
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Admin
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigate({ to: '/admin/users' })}>
                                                User Management
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate({ to: '/admin/site-config' })}>
                                                Site Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate({ to: '/admin/store-settings' })}>
                                                Store Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate({ to: '/admin/stripe-settings' })}>
                                                Stripe Settings
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <Button
                            onClick={handleAuth}
                            disabled={disabled}
                            variant={isAuthenticated ? 'outline' : 'default'}
                        >
                            {text}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t bg-muted/50 py-12">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-display text-lg font-semibold mb-4">ArtistConnect</h3>
                            <p className="text-sm text-muted-foreground">
                                Connecting artists with opportunities and audiences worldwide.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                {navLinks.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-semibold mb-4">Connect</h3>
                            <div className="flex gap-4">
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <SiFacebook className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <SiX className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <SiInstagram className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <SiLinkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} ArtistConnect. All rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Built with ❤️ using{' '}
                            <a
                                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
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
