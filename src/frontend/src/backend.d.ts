import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GetAllServicesResponse {
    services: Array<Service>;
}
export interface Product {
    id: string;
    title: string;
    subcategory: string;
    artistId: Principal;
    productImages: Array<ExternalBlob>;
    description: string;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface GetAvailableTimeSlotsResponse {
    timeSlots: Array<string>;
}
export interface CreateArtistProfileRequest {
    bio: string;
    contactInfo: string;
    skills: Array<string>;
}
export interface CalculateTimeRangeRequest {
    startTime: string;
    endDate: Time;
    endTime: string;
    startDate: Time;
}
export interface BookServiceRequest {
    date: Time;
    artistId: Principal;
    serviceId: bigint;
}
export interface UpdateServiceRequest {
    duration: bigint;
    name: string;
    description: string;
    category?: string;
    price: bigint;
}
export interface ArtistProfileResponse {
    profile: ArtistProfile;
}
export interface StoreProductConfig {
    productCategoryLimit: bigint;
    lowStockThreshold: bigint;
    returnPeriodDays: bigint;
    productCategories: Array<string>;
    freeShippingThreshold: bigint;
    productTags: Array<string>;
    pricingRules: PricingRule;
    filterOptions: Array<StoreProductFilter>;
    inventoryTrackingEnabled: boolean;
    requireApprovalFor: {
        gigs: boolean;
        jobs: boolean;
        products: boolean;
    };
    defaultCurrency: string;
    featuredProducts: Array<string>;
    productStatuses: Array<string>;
    taxRate: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Gig {
    id: string;
    title: string;
    artistId: Principal;
    description: string;
    deliveryTime: Time;
    pricing: bigint;
}
export interface DeleteServiceRequest {
    id: bigint;
}
export interface Booking {
    id: string;
    serviceType: string;
    duration: bigint;
    clientId: Principal;
    date: Time;
    time: string;
    artistId: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface JobOffering {
    id: string;
    description: string;
    deadline: Time;
    employer: Principal;
    jobTitle: string;
    budget: bigint;
}
export interface CreateServiceRequest {
    duration: bigint;
    name: string;
    description: string;
    category?: string;
    price: bigint;
}
export interface CreateArtistProfileResponse {
    id: string;
}
export interface AllArtistProfilesResponse {
    profiles: Array<ArtistProfile>;
}
export interface StoreProductFilter {
    maxPrice?: bigint;
    available?: boolean;
    category?: string;
    rating?: bigint;
    minPrice?: bigint;
}
export interface SearchServicesByCategoryResponse {
    services: Array<Service>;
}
export interface GetBookingsByCodeResponse {
    bookings: Array<Booking>;
}
export interface StripeStoreConfig {
    webhookSecret: string;
    testMode: boolean;
    secretKey: string;
    currency: string;
    publishableKey: string;
    webhookEndpoint: string;
}
export interface Service {
    id: bigint;
    duration: bigint;
    name: string;
    artistId: Principal;
    description: string;
    category?: string;
    price: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Range {
    end: Time;
    start: Time;
}
export interface GetServicesByArtistResponse {
    services: Array<Service>;
}
export interface ArtistProfile {
    id: string;
    bio: string;
    contactInfo: string;
    portfolioImages: Array<ExternalBlob>;
    skills: Array<string>;
}
export interface PricingRule {
    maxPrice: bigint;
    minPrice: bigint;
}
export interface Music {
    id: string;
    title: string;
    audioFileBlob: ExternalBlob;
    description: string;
    category: string;
    artist: Principal;
    price: bigint;
    uploadDate: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPortfolioImage(blob: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookService(request: BookServiceRequest): Promise<void>;
    calculateTimeRange(arg0: CalculateTimeRangeRequest): Promise<void>;
    createArtistProfile(artist: CreateArtistProfileRequest): Promise<CreateArtistProfileResponse>;
    createBooking(booking: Booking): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGig(gig: Gig): Promise<void>;
    createJobOffering(offering: JobOffering): Promise<void>;
    createMusic(id: string, title: string, audioFileBlob: ExternalBlob, price: bigint, description: string, category: string): Promise<void>;
    createProduct(id: string, title: string, description: string, price: bigint, productImages: Array<ExternalBlob>, subcategory: string): Promise<void>;
    createProductFromImage(productId: string, image: ExternalBlob): Promise<void>;
    createService(request: CreateServiceRequest): Promise<void>;
    deleteBooking(id: string): Promise<void>;
    deleteGig(id: string): Promise<void>;
    deleteJobOffering(id: string): Promise<void>;
    deleteMusic(id: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    deleteService(request: DeleteServiceRequest): Promise<void>;
    findBookingsByArtist(artistId: Principal): Promise<Array<Booking>>;
    findBookingsByDate(): Promise<Array<Booking>>;
    findGigsByDeliveryTime(): Promise<Array<Gig>>;
    findGigsByPricing(): Promise<Array<Gig>>;
    findJobOfferingsByBudget(): Promise<Array<JobOffering>>;
    findJobOfferingsByDeadline(): Promise<Array<JobOffering>>;
    findMusicByArtist(artist: Principal): Promise<Array<Music>>;
    findMusicByPrice(): Promise<Array<Music>>;
    findProductsByArtist(artistId: Principal): Promise<Array<Product>>;
    findProductsByPrice(): Promise<Array<Product>>;
    getAllArtists(): Promise<AllArtistProfilesResponse>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllGigs(): Promise<Array<Gig>>;
    getAllJobOfferings(): Promise<Array<JobOffering>>;
    getAllMusic(): Promise<Array<Music>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllServices(): Promise<GetAllServicesResponse>;
    getArtistById(id: string): Promise<ArtistProfileResponse>;
    getAvailableTimeSlots(arg0: Range): Promise<GetAvailableTimeSlotsResponse>;
    getBookingsByCode(arg0: string): Promise<GetBookingsByCodeResponse>;
    getCallerUserRole(): Promise<UserRole>;
    getMusicById(id: string): Promise<Music | null>;
    getServicesByArtist(artistId: Principal): Promise<GetServicesByArtistResponse>;
    getStoreProductConfig(): Promise<StoreProductConfig>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getStripeStoreConfig(): Promise<StripeStoreConfig>;
    grantAdminPrivileges(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    searchServicesByCategory(category: string): Promise<SearchServicesByCategoryResponse>;
    setRequireApprovalFor(jobs: boolean, products: boolean, gigs: boolean): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setStripeStoreConfig(config: StripeStoreConfig): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBooking(booking: Booking): Promise<void>;
    updateGig(gig: Gig): Promise<void>;
    updateJobOffering(offering: JobOffering): Promise<void>;
    updateMusic(id: string, newTitle: string, newPrice: bigint, newDescription: string, newCategory: string): Promise<void>;
    updateProduct(id: string, title: string, description: string, price: bigint, productImages: Array<ExternalBlob>, subcategory: string): Promise<void>;
    updateService(id: bigint, request: UpdateServiceRequest): Promise<void>;
    updateStoreProductConfig(inventoryThreshold: bigint, freeShippingAmount: bigint, taxRate: bigint, categoryLimit: bigint, returnDays: bigint, pricingRules: PricingRule, productCategories: Array<string>, productTags: Array<string>, featuredProducts: Array<string>, productStatuses: Array<string>): Promise<void>;
    uploadImage(blob: ExternalBlob): Promise<void>;
}
