import React from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Package, CreditCard, BarChart3, Palette, DollarSign, Users, LayoutDashboard } from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';
import { useQueryClient } from '@tanstack/react-query';

export default function Layout() {
  const { identity, clear, loginStatus, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold">
                Artist Platform
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/artists"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  Artists
                </Link>
                <Link
                  to="/jobs"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  Jobs
                </Link>
                <Link
                  to="/gigs"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  Gigs
                </Link>
                <Link
                  to="/store"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  Store
                </Link>
                <Link
                  to="/music"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  activeProps={{ className: 'text-primary' }}
                >
                  Music
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/artist/onboarding">
                <Button variant="outline" size="sm">
                  Become an Artist
                </Button>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => navigate({ to: '/account/dashboard' })}>
                        <Settings className="mr-2 h-4 w-4" />
                        Account Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: '/artist/items' })}>
                        <Package className="mr-2 h-4 w-4" />
                        My Items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: '/stripe-connect' })}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Stripe Connect
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleAuth}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {!isAdminLoading && isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Admin
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/dashboard' })}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/branding' })}>
                          <Palette className="mr-2 h-4 w-4" />
                          Branding
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/revenue' })}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Revenue Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/commission' })}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Commission Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/users' })}>
                          <Users className="mr-2 h-4 w-4" />
                          User Management
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/stripe-settings' })}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Stripe Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate({ to: '/admin/store-settings' })}>
                          <Settings className="mr-2 h-4 w-4" />
                          Store Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ) : (
                <Button onClick={handleAuth} disabled={isLoggingIn} size="sm">
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Artist Platform</h3>
              <p className="text-sm text-muted-foreground">
                Empowering artists and connecting them with opportunities worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/artists" className="text-muted-foreground hover:text-primary">
                    Browse Artists
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="text-muted-foreground hover:text-primary">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/gigs" className="text-muted-foreground hover:text-primary">
                    Explore Gigs
                  </Link>
                </li>
                <li>
                  <Link to="/store" className="text-muted-foreground hover:text-primary">
                    Shop Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <SiLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Artist Platform. Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
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
