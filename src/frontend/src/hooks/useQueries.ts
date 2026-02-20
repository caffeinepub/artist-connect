import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
    ArtistProfile,
    JobOffering,
    Gig,
    Booking,
    Product,
    Service,
    CreateArtistProfileRequest,
    CreateServiceRequest,
    UpdateServiceRequest,
    BookServiceRequest,
    ShoppingItem,
    StripeConfiguration
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// Artist Profile Queries
export function useGetAllArtists() {
    const { actor, isFetching } = useActor();

    return useQuery<ArtistProfile[]>({
        queryKey: ['artists'],
        queryFn: async () => {
            if (!actor) return [];
            const response = await actor.getAllArtists();
            return response.profiles;
        },
        enabled: !!actor && !isFetching
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
        enabled: !!actor && !isFetching && !!id
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
        }
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
        }
    });
}

// Job Offering Queries
export function useGetAllJobOfferings() {
    const { actor, isFetching } = useActor();

    return useQuery<JobOffering[]>({
        queryKey: ['jobOfferings'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllJobOfferings();
        },
        enabled: !!actor && !isFetching
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
        }
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
        }
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
        }
    });
}

// Gig Queries
export function useGetAllGigs() {
    const { actor, isFetching } = useActor();

    return useQuery<Gig[]>({
        queryKey: ['gigs'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllGigs();
        },
        enabled: !!actor && !isFetching
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
        }
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
        }
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
        }
    });
}

// Booking Queries
export function useGetAllBookings() {
    const { actor, isFetching } = useActor();

    return useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllBookings();
        },
        enabled: !!actor && !isFetching
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
        }
    });
}

export function useFindBookingsByArtist(artistId: string) {
    const { actor, isFetching } = useActor();

    return useQuery<Booking[]>({
        queryKey: ['bookings', 'artist', artistId],
        queryFn: async () => {
            if (!actor || !artistId) return [];
            return actor.findBookingsByArtist(Principal.fromText(artistId));
        },
        enabled: !!actor && !isFetching && !!artistId
    });
}

// Product Queries
export function useGetAllProducts() {
    const { actor, isFetching } = useActor();

    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllProducts();
        },
        enabled: !!actor && !isFetching
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
        }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createProduct(
                product.id,
                product.title,
                product.description,
                product.price,
                product.productImages
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
}

// Service Queries
export function useGetAllServices() {
    const { actor, isFetching } = useActor();

    return useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            if (!actor) return [];
            const response = await actor.getAllServices();
            return response.services;
        },
        enabled: !!actor && !isFetching
    });
}

export function useGetServicesByArtist(artistId: string) {
    const { actor, isFetching } = useActor();

    return useQuery<Service[]>({
        queryKey: ['services', 'artist', artistId],
        queryFn: async () => {
            if (!actor || !artistId) return [];
            const response = await actor.getServicesByArtist(Principal.fromText(artistId));
            return response.services;
        },
        enabled: !!actor && !isFetching && !!artistId
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
        }
    });
}

// Stripe Queries
export function useIsStripeConfigured() {
    const { actor, isFetching } = useActor();

    return useQuery<boolean>({
        queryKey: ['stripeConfigured'],
        queryFn: async () => {
            if (!actor) return false;
            return actor.isStripeConfigured();
        },
        enabled: !!actor && !isFetching
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
            queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
        }
    });
}

export function useCreateCheckoutSession() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
            if (!actor) throw new Error('Actor not available');
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const successUrl = `${baseUrl}/#/payment-success`;
            const cancelUrl = `${baseUrl}/#/payment-failure`;
            const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
            const session = JSON.parse(result) as { id: string; url: string };
            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }
            return session;
        }
    });
}
