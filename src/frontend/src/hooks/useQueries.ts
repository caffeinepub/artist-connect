import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  ArtistProfile,
  JobOffering,
  Gig,
  Booking,
  Product,
  Music,
  Service,
  StoreProductConfig,
  StripeStoreConfig,
  UserRole,
  ArtistRevenue,
  PaymentTransaction,
  ShoppingItem,
  PricingRule,
  StoreProductFilter,
  UpdateArtistProfileRequest,
  StripeConfiguration,
  PlatformRevenueMetrics,
  UserInfo,
  SiteBranding,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Artists
export function useGetAllArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) return [];
      const response = await actor.getAllArtists();
      return response.profiles;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArtistById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile | null>({
    queryKey: ['artist', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        const response = await actor.getArtistById(id);
        return response.profile;
      } catch (error) {
        console.error('Error fetching artist:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { bio: string; skills: string[]; contactInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArtistProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useUpdateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateArtistProfileRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtistProfile(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

// Jobs
export function useGetAllJobOfferings() {
  const { actor, isFetching } = useActor();

  return useQuery<JobOffering[]>({
    queryKey: ['jobOfferings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobOfferings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJobOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: JobOffering) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJobOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOfferings'] });
    },
  });
}

export function useUpdateJobOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: JobOffering) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOfferings'] });
    },
  });
}

export function useDeleteJobOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteJobOffering(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobOfferings'] });
    },
  });
}

// Gigs
export function useGetAllGigs() {
  const { actor, isFetching } = useActor();

  return useQuery<Gig[]>({
    queryKey: ['gigs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGigs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGigById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Gig | null>({
    queryKey: ['gig', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const gigs = await actor.getAllGigs();
      return gigs.find((g) => g.id === id) || null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateGig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gig: Gig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGig(gig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    },
  });
}

export function useUpdateGig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gig: Gig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGig(gig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    },
  });
}

export function useDeleteGig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGig(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
    },
  });
}

// Products
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByArtist(artistId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'artist', artistId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findProductsByArtist(artistId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        product.id,
        product.title,
        product.description,
        BigInt(product.price),
        product.productImages,
        product.subcategory
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(
        product.id,
        product.title,
        product.description,
        BigInt(product.price),
        product.productImages,
        product.subcategory
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Music
export function useGetAllMusic() {
  const { actor, isFetching } = useActor();

  return useQuery<Music[]>({
    queryKey: ['music'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMusic();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMusicByArtist(artistId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Music[]>({
    queryKey: ['music', 'artist', artistId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findMusicByArtist(artistId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMusic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (music: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMusic(
        music.id,
        music.title,
        music.audioFileBlob,
        BigInt(music.price),
        music.description,
        music.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music'] });
    },
  });
}

export function useUpdateMusic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (music: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMusic(
        music.id,
        music.title,
        BigInt(music.price),
        music.description,
        music.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music'] });
    },
  });
}

export function useDeleteMusic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMusic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music'] });
    },
  });
}

// Bookings
export function useGetAllBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Services
export function useGetServicesByArtist(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services', 'artist', artistId],
    queryFn: async () => {
      if (!actor) return [];
      const artistPrincipal = Principal.fromText(artistId);
      const response = await actor.getServicesByArtist(artistPrincipal);
      return response.services;
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

// Admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<UserInfo[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Store Config
export function useGetStoreProductConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<StoreProductConfig>({
    queryKey: ['storeConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStoreProductConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStoreProductConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStoreProductConfig(
        BigInt(config.inventoryThreshold),
        BigInt(config.freeShippingAmount),
        BigInt(config.taxRate),
        BigInt(config.categoryLimit),
        BigInt(config.returnDays),
        config.filterOptions,
        config.pricingRules,
        config.productCategories,
        config.productTags,
        config.featuredProducts,
        config.productStatuses
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
    },
  });
}

export function useSetRequireApprovalFor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobs, products, gigs }: { jobs: boolean; products: boolean; gigs: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRequireApprovalFor(jobs, products, gigs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
    },
  });
}

// Stripe
export function useGetStripeStoreConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<StripeStoreConfig>({
    queryKey: ['stripeConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeStoreConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeStoreConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeStoreConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeStoreConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfig'] });
    },
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfig'] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      items,
      successUrl,
      cancelUrl,
    }: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useCheckoutProduct() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      productId,
      successUrl,
      cancelUrl,
    }: {
      productId: string;
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.checkoutAndPayProduct(productId, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useCheckoutGig() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      gigId,
      successUrl,
      cancelUrl,
    }: {
      gigId: string;
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const gigs = await actor.getAllGigs();
      const gig = gigs.find((g) => g.id === gigId);
      if (!gig) throw new Error('Gig not found');

      const item: ShoppingItem = {
        currency: 'USD',
        productName: gig.title,
        productDescription: gig.description,
        priceInCents: gig.pricing,
        quantity: BigInt(1),
      };

      const result = await actor.createCheckoutSession([item], successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useCheckoutMusic() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      musicId,
      successUrl,
      cancelUrl,
    }: {
      musicId: string;
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const music = await actor.getMusicById(musicId);
      if (!music) throw new Error('Music not found');

      const item: ShoppingItem = {
        currency: 'USD',
        productName: music.title,
        productDescription: music.description,
        priceInCents: music.price,
        quantity: BigInt(1),
      };

      const result = await actor.createCheckoutSession([item], successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useDonateToArtist() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      artistId,
      amount,
      successUrl,
      cancelUrl,
    }: {
      artistId: string;
      amount: number;
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const artistPrincipal = Principal.fromText(artistId);
      const result = await actor.donateToArtist(artistPrincipal, BigInt(amount), successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

// Revenue
export function useGetArtistRevenue(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistRevenue>({
    queryKey: ['artistRevenue', artistId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const artistPrincipal = Principal.fromText(artistId);
      return actor.getArtistRevenue(artistPrincipal);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useGetPaymentTransactionHistory(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentTransaction[]>({
    queryKey: ['paymentTransactions', artistId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const artistPrincipal = Principal.fromText(artistId);
      return actor.getPaymentTransactionHistory(artistPrincipal);
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useGetPlatformRevenueMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<PlatformRevenueMetrics>({
    queryKey: ['platformRevenueMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformRevenueMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllArtistRevenues() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistRevenue[]>({
    queryKey: ['allArtistRevenues'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllArtistRevenues();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPaymentTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentTransaction[]>({
    queryKey: ['allPaymentTransactions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPaymentTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPlatformCommissionRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionPercentage: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPlatformCommissionRate(BigInt(commissionPercentage));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
    },
  });
}

// Site Branding
export function useGetSiteBranding() {
  const { actor, isFetching } = useActor();

  return useQuery<SiteBranding>({
    queryKey: ['siteBranding'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteBranding();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSiteBranding() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branding: SiteBranding) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSiteBranding(branding);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteBranding'] });
    },
  });
}
