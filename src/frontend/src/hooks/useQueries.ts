import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  ArtistProfile,
  CreateArtistProfileRequest,
  JobOffering,
  Gig,
  Booking,
  Product,
  Music,
  StoreProductConfig,
  PricingRule,
  StripeStoreConfig,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  UserRole,
  ShoppingItem,
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

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
      const response = await actor.getArtistById(id);
      return response.profile;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: CreateArtistProfileRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArtistProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useAddPortfolioImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPortfolioImage(blob);
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
    queryKey: ['jobs'],
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useGetBookingsByArtist(artistId: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['bookings', 'artist', artistId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.findBookingsByArtist(artistId);
    },
    enabled: !!actor && !isFetching,
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

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      id: string;
      title: string;
      description: string;
      price: bigint;
      productImages: ExternalBlob[];
      subcategory: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        product.id,
        product.title,
        product.description,
        product.price,
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
    mutationFn: async (product: {
      id: string;
      title: string;
      description: string;
      price: bigint;
      productImages: ExternalBlob[];
      subcategory: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(
        product.id,
        product.title,
        product.description,
        product.price,
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

export interface BulkProductItem {
  file: File;
  blob: ExternalBlob;
  category: string;
  subcategory: string;
  price: number;
  description: string;
}

export interface BulkProductResult {
  productId: string;
  fileName: string;
  success: boolean;
  error?: string;
}

export function useBulkCreateProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: BulkProductItem[]): Promise<BulkProductResult[]> => {
      if (!actor) throw new Error('Actor not available');

      const results: BulkProductResult[] = [];

      for (const item of items) {
        const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          await actor.createProduct(
            productId,
            item.file.name.replace(/\.[^/.]+$/, ''),
            item.description,
            BigInt(Math.round(item.price * 100)),
            [item.blob],
            item.subcategory
          );
          results.push({
            productId,
            fileName: item.file.name,
            success: true,
          });
        } catch (error) {
          results.push({
            productId,
            fileName: item.file.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
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

export function useGetMusicById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Music | null>({
    queryKey: ['music', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getMusicById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateMusic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (music: {
      id: string;
      title: string;
      audioFileBlob: ExternalBlob;
      price: bigint;
      description: string;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMusic(
        music.id,
        music.title,
        music.audioFileBlob,
        music.price,
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
    mutationFn: async (music: {
      id: string;
      title: string;
      price: bigint;
      description: string;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMusic(
        music.id,
        music.title,
        music.price,
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

// Services
export function useGetAllServices() {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      const response = await actor.getAllServices();
      return response.services;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetServicesByArtist(artistId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services', 'artist', artistId],
    queryFn: async () => {
      if (!actor || !artistId) return [];
      try {
        const principal = Principal.fromText(artistId);
        const response = await actor.getServicesByArtist(principal);
        return response.services;
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!artistId,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: CreateServiceRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createService(service);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: bigint; request: UpdateServiceRequest }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateService(id, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteService({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// Store Configuration
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
    mutationFn: async (config: {
      inventoryThreshold: bigint;
      freeShippingAmount: bigint;
      taxRate: bigint;
      categoryLimit: bigint;
      returnDays: bigint;
      pricingRules: PricingRule;
      productCategories: string[];
      productTags: string[];
      featuredProducts: string[];
      productStatuses: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStoreProductConfig(
        config.inventoryThreshold,
        config.freeShippingAmount,
        config.taxRate,
        config.categoryLimit,
        config.returnDays,
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
    mutationFn: async (config: { jobs: boolean; products: boolean; gigs: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRequireApprovalFor(config.jobs, config.products, config.gigs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeConfig'] });
    },
  });
}

// Stripe Configuration
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStripeStoreConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<StripeStoreConfig>({
    queryKey: ['stripeStoreConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeStoreConfig();
    },
    enabled: !!actor && !isFetching,
    retry: false,
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
      queryClient.invalidateQueries({ queryKey: ['stripeStoreConfig'] });
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

// Stripe Checkout
export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

// Authorization
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

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

export function useAssignAdminPrivileges() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_adminPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.grantAdminPrivileges();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
