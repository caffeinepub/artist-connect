import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArtistsListPage from './pages/ArtistsListPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import JobOfferingsPage from './pages/JobOfferingsPage';
import JobOfferingDetailPage from './pages/JobOfferingDetailPage';
import GigsPage from './pages/GigsPage';
import GigDetailPage from './pages/GigDetailPage';
import BookingsPage from './pages/BookingsPage';
import BookServicePage from './pages/BookServicePage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import MusicLibraryPage from './pages/MusicLibraryPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminSiteConfigPage from './pages/AdminSiteConfigPage';
import AdminStoreSettingsPage from './pages/AdminStoreSettingsPage';
import AdminStripeSettingsPage from './pages/AdminStripeSettingsPage';
import AdminBrandingPage from './pages/AdminBrandingPage';
import AdminRevenueDashboardPage from './pages/AdminRevenueDashboardPage';
import AdminCommissionSettingsPage from './pages/AdminCommissionSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AccountDashboardPage from './pages/AccountDashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import AdminSetupPage from './pages/AdminSetupPage';
import StripeConnectOnboardingPage from './pages/StripeConnectOnboardingPage';
import ArtistItemManagementPage from './pages/ArtistItemManagementPage';
import ArtistOnboardingPage from './pages/ArtistOnboardingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const artistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artists',
  component: ArtistsListPage,
});

const artistProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artists/$id',
  component: ArtistProfilePage,
});

const myProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-profile',
  component: MyProfilePage,
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs',
  component: JobOfferingsPage,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jobs/$id',
  component: JobOfferingDetailPage,
});

const gigsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gigs',
  component: GigsPage,
});

const gigDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gigs/$id',
  component: GigDetailPage,
});

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: BookingsPage,
});

const bookServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book/$artistId',
  component: BookServicePage,
});

const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store',
  component: StorePage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store/$id',
  component: ProductDetailPage,
});

const musicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/music',
  component: MusicLibraryPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUserManagementPage,
});

const adminSiteConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/site-config',
  component: AdminSiteConfigPage,
});

const adminStoreSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/store-settings',
  component: AdminStoreSettingsPage,
});

const adminStripeSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/stripe-settings',
  component: AdminStripeSettingsPage,
});

const adminBrandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/branding',
  component: AdminBrandingPage,
});

const adminRevenueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/revenue',
  component: AdminRevenueDashboardPage,
});

const adminCommissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/commission',
  component: AdminCommissionSettingsPage,
});

const accountDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/dashboard',
  component: AccountDashboardPage,
});

const productManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/products',
  component: ProductManagementPage,
});

const paymentSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/payments',
  component: PaymentSettingsPage,
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-setup',
  component: AdminSetupPage,
});

const stripeConnectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stripe-connect',
  component: StripeConnectOnboardingPage,
});

const artistItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/items',
  component: ArtistItemManagementPage,
});

const artistOnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/onboarding',
  component: ArtistOnboardingPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  artistsRoute,
  artistProfileRoute,
  myProfileRoute,
  jobsRoute,
  jobDetailRoute,
  gigsRoute,
  gigDetailRoute,
  bookingsRoute,
  bookServiceRoute,
  storeRoute,
  productDetailRoute,
  musicRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminDashboardRoute,
  adminUsersRoute,
  adminSiteConfigRoute,
  adminStoreSettingsRoute,
  adminStripeSettingsRoute,
  adminBrandingRoute,
  adminRevenueRoute,
  adminCommissionRoute,
  accountDashboardRoute,
  productManagementRoute,
  paymentSettingsRoute,
  adminSetupRoute,
  stripeConnectRoute,
  artistItemsRoute,
  artistOnboardingRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
