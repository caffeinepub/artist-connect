import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
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
import CartPage from './pages/CartPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminSiteConfigPage from './pages/AdminSiteConfigPage';
import AdminStoreSettingsPage from './pages/AdminStoreSettingsPage';
import AdminStripeSettingsPage from './pages/AdminStripeSettingsPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
    component: Layout
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage
});

const artistsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/artists',
    component: ArtistsListPage
});

const artistProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/artists/$id',
    component: ArtistProfilePage
});

const myProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/my-profile',
    component: MyProfilePage
});

const jobsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/jobs',
    component: JobOfferingsPage
});

const jobDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/jobs/$id',
    component: JobOfferingDetailPage
});

const gigsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/gigs',
    component: GigsPage
});

const gigDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/gigs/$id',
    component: GigDetailPage
});

const bookingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/bookings',
    component: BookingsPage
});

const bookServiceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/book/$artistId',
    component: BookServicePage
});

const storeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/store',
    component: StorePage
});

const productDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/store/$id',
    component: ProductDetailPage
});

const musicRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/music',
    component: MusicLibraryPage
});

const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cart',
    component: CartPage
});

const paymentSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-success',
    component: PaymentSuccessPage
});

const paymentFailureRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-failure',
    component: PaymentFailurePage
});

const adminUsersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/users',
    component: AdminUserManagementPage
});

const adminSettingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/settings',
    component: AdminSiteConfigPage
});

const adminStoreSettingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/store-settings',
    component: AdminStoreSettingsPage
});

const adminStripeSettingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/stripe-settings',
    component: AdminStripeSettingsPage
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
    cartRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
    adminUsersRoute,
    adminSettingsRoute,
    adminStoreSettingsRoute,
    adminStripeSettingsRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    );
}
