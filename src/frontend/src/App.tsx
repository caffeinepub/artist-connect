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
import CartPage from './pages/CartPage';
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

const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cart',
    component: CartPage
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
    cartRoute
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
