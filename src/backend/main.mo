import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Nat "mo:core/Nat";



actor {
  // Initialize access control state
  let accessControlState = AccessControl.initState();

  // Include authorization mixin for user profile management
  include MixinAuthorization(accessControlState);

  // Include storage mixin
  include MixinStorage();

  /// Artists

  public type ArtistProfile = {
    id : Text;
    bio : Text;
    portfolioImages : [Storage.ExternalBlob];
    skills : [Text];
    contactInfo : Text;
  };

  let profiles = Map.empty<Principal, ArtistProfile>();

  module ArtistProfile {
    public func compareByBio(artist1 : ArtistProfile, artist2 : ArtistProfile) : Order.Order {
      Text.compare(artist1.bio, artist2.bio);
    };
  };

  /// Jobs

  public type JobOffering = {
    id : Text;
    employer : Principal;
    jobTitle : Text;
    description : Text;
    budget : Nat;
    deadline : Time.Time;
  };

  let jobOfferings = Map.empty<Text, JobOffering>();

  module JobOffering {
    public func compareByBudget(job1 : JobOffering, job2 : JobOffering) : Order.Order {
      Nat.compare(job1.budget, job2.budget);
    };
  };

  module JobOfferingIter {
    public func deadlineCompare(job1 : JobOffering, job2 : JobOffering) : Order.Order {
      Int.compare(job1.deadline.toNat().toInt(), job2.deadline.toNat().toInt());
    };
  };

  /// Gigs

  public type Gig = {
    id : Text;
    artistId : Principal;
    title : Text;
    description : Text;
    pricing : Nat;
    deliveryTime : Time.Time;
  };

  let gigs = Map.empty<Text, Gig>();

  module Gig {
    public func compareByPricing(gig1 : Gig, gig2 : Gig) : Order.Order {
      Nat.compare(gig1.pricing, gig2.pricing);
    };
  };

  /// Service Booking

  public type Booking = {
    id : Text;
    artistId : Principal;
    clientId : Principal;
    date : Time.Time;
    time : Text;
    serviceType : Text;
    duration : Nat;
  };

  let bookings = Map.empty<Text, Booking>();

  module Booking {
    public func compareByDate(booking1 : Booking, booking2 : Booking) : Order.Order {
      Int.compare(booking1.date.toNat().toInt(), booking2.date.toNat().toInt());
    };
  };

  /// Products

  public type Product = {
    id : Text;
    artistId : Principal;
    title : Text;
    description : Text;
    price : Nat;
    productImages : [Storage.ExternalBlob];
    subcategory : Text;
  };

  let products = Map.empty<Text, Product>();

  module Product {
    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };
  };

  /// Music

  public type Music = {
    id : Text;
    title : Text;
    artist : Principal;
    audioFileBlob : Storage.ExternalBlob;
    price : Nat;
    description : Text;
    category : Text;
    uploadDate : Int;
  };

  let music = Map.empty<Text, Music>();

  module MusicIter {
    public func compareByUploadDate(music1 : Music, music2 : Music) : Order.Order {
      if (music1.uploadDate < music2.uploadDate) { #less } else {
        if (music1.uploadDate > music2.uploadDate) { #greater } else { #equal };
      };
    };
  };

  module MusicIterPrice {
    public func compareByPrice(music1 : Music, music2 : Music) : Order.Order {
      Nat.compare(music1.price, music2.price);
    };
  };

  // Artist Management

  public type AllArtistProfilesResponse = {
    profiles : [ArtistProfile];
  };

  public type ArtistProfileResponse = {
    profile : ArtistProfile;
  };

  public type CreateArtistProfileRequest = {
    bio : Text;
    skills : [Text];
    contactInfo : Text;
  };

  public type CreateArtistProfileResponse = {
    id : Text;
  };

  public query ({ caller }) func getAllArtists() : async AllArtistProfilesResponse {
    let array = profiles.values().toArray();
    { profiles = array };
  };

  public query ({ caller }) func getArtistById(id : Text) : async ArtistProfileResponse {
    let found = profiles.values().toArray().find(
      func(artist) { artist.id == id }
    );
    switch (found) {
      case (?profile) { { profile } };
      case (null) { Runtime.trap("Artist not found") };
    };
  };

  public shared ({ caller }) func createArtistProfile(artist : CreateArtistProfileRequest) : async CreateArtistProfileResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create artist profiles");
    };

    let id = (switch (profiles.get(caller)) {
      case (null) {
        let internal = {
          id = caller.toText();
          portfolioImages = [];
          bio = artist.bio;
          skills = artist.skills;
          contactInfo = artist.contactInfo;
        };
        profiles.add(caller, internal);
        caller.toText();
      };
      case (?value) { value.id };
    });
    { id };
  };

  public shared ({ caller }) func addPortfolioImage(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add portfolio images");
    };

    let artist = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?value) { value };
    };
    let newProfile : ArtistProfile = {
      id = artist.id;
      portfolioImages = artist.portfolioImages.concat([blob]);
      bio = artist.bio;
      skills = artist.skills;
      contactInfo = artist.contactInfo;
    };
    profiles.add(caller, newProfile);
  };

  // Job Management

  public shared ({ caller }) func createJobOffering(offering : JobOffering) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create job offerings");
    };

    // Verify the employer field matches the caller
    if (offering.employer != caller) {
      Runtime.trap("Unauthorized: Cannot create job offering for another user");
    };

    jobOfferings.add(offering.id, offering);
  };

  public shared ({ caller }) func updateJobOffering(offering : JobOffering) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update job offerings");
    };

    // Verify ownership
    switch (jobOfferings.get(offering.id)) {
      case (null) { Runtime.trap("Job offering not found") };
      case (?existing) {
        if (existing.employer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own job offerings");
        };
      };
    };

    jobOfferings.add(offering.id, offering);
  };

  public shared ({ caller }) func deleteJobOffering(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete job offerings");
    };

    // Verify ownership
    switch (jobOfferings.get(id)) {
      case (null) { Runtime.trap("Job offering not found") };
      case (?existing) {
        if (existing.employer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own job offerings");
        };
      };
    };

    jobOfferings.remove(id);
  };

  public query ({ caller }) func getAllJobOfferings() : async [JobOffering] {
    jobOfferings.values().toArray();
  };

  public query ({ caller }) func findJobOfferingsByBudget() : async [JobOffering] {
    let array = jobOfferings.values().toArray();
    array.sort(JobOffering.compareByBudget);
  };

  public query ({ caller }) func findJobOfferingsByDeadline() : async [JobOffering] {
    let array = jobOfferings.values().toArray();
    array.sort(JobOfferingIter.deadlineCompare);
  };

  // Gig Management

  public shared ({ caller }) func createGig(gig : Gig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create gigs");
    };

    // Verify the artistId matches the caller
    if (gig.artistId != caller) {
      Runtime.trap("Unauthorized: Cannot create gig for another artist");
    };

    gigs.add(gig.id, gig);
  };

  public shared ({ caller }) func updateGig(gig : Gig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update gigs");
    };

    // Verify ownership
    switch (gigs.get(gig.id)) {
      case (null) { Runtime.trap("Gig not found") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own gigs");
        };
      };
    };

    gigs.add(gig.id, gig);
  };

  public shared ({ caller }) func deleteGig(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete gigs");
    };

    // Verify ownership
    switch (gigs.get(id)) {
      case (null) { Runtime.trap("Gig not found") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own gigs");
        };
      };
    };

    gigs.remove(id);
  };

  public query ({ caller }) func getAllGigs() : async [Gig] {
    gigs.values().toArray();
  };

  public query ({ caller }) func findGigsByPricing() : async [Gig] {
    let array = gigs.values().toArray();
    array.sort(Gig.compareByPricing);
  };

  public query ({ caller }) func findGigsByDeliveryTime() : async [Gig] {
    let array = gigs.values().toArray();
    array.sort(Gig.compareByPricing);
  };

  // Booking Management

  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    // Verify the clientId matches the caller
    if (booking.clientId != caller) {
      Runtime.trap("Unauthorized: Cannot create booking for another client");
    };

    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func updateBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bookings");
    };

    // Verify ownership (either client or artist can update)
    switch (bookings.get(booking.id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?existing) {
        if (existing.clientId != caller and existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own bookings");
        };
      };
    };

    bookings.add(booking.id, booking);
  };

  public shared ({ caller }) func deleteBooking(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bookings");
    };

    // Verify ownership (either client or artist can delete)
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?existing) {
        if (existing.clientId != caller and existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own bookings");
        };
      };
    };

    bookings.remove(id);
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all bookings");
    };

    // Filter to only show bookings where caller is involved
    let array = bookings.values().toArray();
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return array;
    };

    array.filter(func(booking) {
      booking.clientId == caller or booking.artistId == caller;
    });
  };

  public query ({ caller }) func findBookingsByDate() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let array = bookings.values().toArray();
    let filtered = if (AccessControl.isAdmin(accessControlState, caller)) {
      array;
    } else {
      array.filter(func(booking) {
        booking.clientId == caller or booking.artistId == caller;
      });
    };
    filtered.sort(Booking.compareByDate);
  };

  public query ({ caller }) func findBookingsByArtist(artistId : Principal) : async [Booking] {
    // Authorization check: Only the artist themselves, their clients, or admins can view bookings
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let array = bookings.values().toArray();
    let filtered = array.filter(func(booking) {
      booking.artistId == artistId;
    });

    // Further filter based on caller permissions
    if (AccessControl.isAdmin(accessControlState, caller) or caller == artistId) {
      // Admins and the artist can see all their bookings
      return filtered;
    } else {
      // Other users can only see bookings where they are the client
      return filtered.filter(func(booking) {
        booking.clientId == caller;
      });
    };
  };

  // Product Management

  public shared ({ caller }) func createProduct(
    id : Text,
    title : Text,
    description : Text,
    price : Nat,
    productImages : [Storage.ExternalBlob],
    subcategory : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };

    let artist = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?value) { value };
    };

    let product = {
      id;
      artistId = caller;
      title;
      price;
      description;
      productImages;
      subcategory;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func createProductFromImage(productId : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };

    ignore switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?_artist) {  };
    };

    let product = {
      id = productId;
      artistId = caller;
      title = "Default Title";
      price = 0;
      description = "Default Description";
      productImages = [image];
      subcategory = "Default Subcategory";
    };
    products.add(productId, product);
  };

  public shared ({ caller }) func updateProduct(
    id : Text,
    title : Text,
    description : Text,
    price : Nat,
    productImages : [Storage.ExternalBlob],
    subcategory : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };

    // Verify ownership
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own products");
        };
      };
    };

    let product = {
      id;
      artistId = caller;
      title;
      price;
      description;
      productImages;
      subcategory;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };

    // Verify ownership
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own products");
        };
      };
    };

    products.remove(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func findProductsByPrice() : async [Product] {
    let array = products.values().toArray();
    array.sort(Product.compareByPrice);
  };

  public query ({ caller }) func findProductsByArtist(artistId : Principal) : async [Product] {
    let array = products.values().toArray();
    array.filter(func(product) {
      product.artistId == artistId;
    });
  };

  // Music Management

  public shared ({ caller }) func createMusic(
    id : Text,
    title : Text,
    audioFileBlob : Storage.ExternalBlob,
    price : Nat,
    description : Text,
    category : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create music");
    };

    let musicItem : Music = {
      id;
      title;
      artist = caller;
      audioFileBlob;
      price;
      description;
      category;
      uploadDate = Time.now();
    };

    music.add(id, musicItem);
  };

  public query ({ caller }) func getAllMusic() : async [Music] {
    music.values().toArray();
  };

  public query ({ caller }) func getMusicById(id : Text) : async ?Music {
    music.get(id);
  };

  public shared ({ caller }) func updateMusic(
    id : Text,
    newTitle : Text,
    newPrice : Nat,
    newDescription : Text,
    newCategory : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update music");
    };

    switch (music.get(id)) {
      case (null) { Runtime.trap("Music item not found") };
      case (?existingMusic) {
        // Verify ownership
        if (existingMusic.artist != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own music");
        };

        // Update music item with new values
        let updatedMusic : Music = {
          id;
          title = newTitle;
          artist = existingMusic.artist;
          audioFileBlob = existingMusic.audioFileBlob;
          price = newPrice;
          description = newDescription;
          category = newCategory;
          uploadDate = Time.now();
        };
        music.add(id, updatedMusic);
      };
    };
  };

  public shared ({ caller }) func deleteMusic(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete music");
    };

    // Verify ownership
    switch (music.get(id)) {
      case (null) { Runtime.trap("Music item not found") };
      case (?existingMusic) {
        if (existingMusic.artist != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own music");
        };
        music.remove(id);
      };
    };
  };

  // Music Queries by Fields

  public query ({ caller }) func findMusicByPrice() : async [Music] {
    let array = music.values().toArray();
    array.sort(MusicIterPrice.compareByPrice);
  };

  public query ({ caller }) func findMusicByArtist(artist : Principal) : async [Music] {
    let array = music.values().toArray();
    array.filter(func(musicItem) {
      musicItem.artist == artist;
    });
  };

  // Store Product Configuration

  public type StoreProductFilter = {
    category : ?Text;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    rating : ?Nat;
    available : ?Bool;
  };

  public type PricingRule = {
    minPrice : Nat;
    maxPrice : Nat;
  };

  public type StoreProductConfig = {
    defaultCurrency : Text;
    inventoryTrackingEnabled : Bool;
    lowStockThreshold : Nat;
    freeShippingThreshold : Nat;
    taxRate : Nat;
    requireApprovalFor : {
      jobs : Bool;
      products : Bool;
      gigs : Bool;
    };
    productCategoryLimit : Nat;
    returnPeriodDays : Nat;
    filterOptions : [StoreProductFilter];
    pricingRules : PricingRule;
    productCategories : [Text];
    productTags : [Text];
    featuredProducts : [Text];
    productStatuses : [Text];
  };

  var storeConfig : StoreProductConfig = {
    defaultCurrency = "USD";
    inventoryTrackingEnabled = true;
    lowStockThreshold = 10;
    freeShippingThreshold = 5000;
    taxRate = 7;
    requireApprovalFor = {
      jobs = true;
      products = true;
      gigs = false;
    };
    productCategoryLimit = 10;
    returnPeriodDays = 30;
    filterOptions = [];
    pricingRules = {
      minPrice = 0;
      maxPrice = 10000;
    };
    productCategories = [
      "cars" // Default car category
    ];
    productTags = [];
    featuredProducts = [];
    productStatuses = ["draft", "active", "archived"];
  };

  let defaultPricingRules : PricingRule = {
    minPrice = 0;
    maxPrice = 10000;
  };

  var storeProductConfig : StoreProductConfig = {
    defaultCurrency = "USD";
    inventoryTrackingEnabled = true;
    lowStockThreshold = 10;
    freeShippingThreshold = 5000;
    taxRate = 7;
    requireApprovalFor = {
      jobs = true;
      products = true;
      gigs = false;
    };
    productCategoryLimit = 10;
    returnPeriodDays = 30;
    filterOptions = [];
    pricingRules = defaultPricingRules;
    productCategories = [
      "cars" // Default car category
    ];
    productTags = [];
    featuredProducts = [];
    productStatuses = [];
  };

  public query ({ caller }) func getStoreProductConfig() : async StoreProductConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view store configuration");
    };
    storeConfig;
  };

  public shared ({ caller }) func updateStoreProductConfig(
    inventoryThreshold : Nat,
    freeShippingAmount : Nat,
    taxRate : Nat,
    categoryLimit : Nat,
    returnDays : Nat,
    pricingRules : PricingRule,
    productCategories : [Text],
    productTags : [Text],
    featuredProducts : [Text],
    productStatuses : [Text],
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update store config");
    };

    storeConfig := {
      storeConfig with
      lowStockThreshold = inventoryThreshold;
      freeShippingThreshold = freeShippingAmount;
      taxRate;
      productCategoryLimit = categoryLimit;
      returnPeriodDays = returnDays;
      pricingRules;
      productCategories;
      productTags;
      featuredProducts;
      productStatuses;
    };
  };

  public shared ({ caller }) func setRequireApprovalFor(jobs : Bool, products : Bool, gigs : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update approval settings");
    };

    storeConfig := {
      storeConfig with
      requireApprovalFor = {
        jobs;
        products;
        gigs;
      };
    };
  };

  // Stripe Integration
  public type StripeStoreConfig = {
    publishableKey : Text;
    secretKey : Text;
    webhookSecret : Text;
    webhookEndpoint : Text;
    currency : Text;
    testMode : Bool;
  };

  var stripeStoreConfig : ?StripeStoreConfig = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can check Stripe configuration status");
    };
    stripeStoreConfig != null;
  };

  public shared ({ caller }) func setStripeStoreConfig(config : StripeStoreConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeStoreConfig := ?config;
  };

  public query ({ caller }) func getStripeStoreConfig() : async StripeStoreConfig {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get Stripe configuration");
    };
    switch (stripeStoreConfig) {
      case (null) { Runtime.trap("Stripe configuration is missing") };
      case (?config) { config };
    };
  };

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe is not configured yet") };
      case (?config) { config };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(
    items : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // Blob Storage
  public shared ({ caller }) func uploadImage(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload images");
    };
  };

  // Service System

  public type Service = {
    id : Nat;
    artistId : Principal;
    name : Text;
    description : Text;
    duration : Nat;
    price : Nat;
    category : ?Text;
  };

  let services = Map.empty<Nat, Service>();
  var nextServiceId = 0;

  public type CreateServiceRequest = {
    name : Text;
    description : Text;
    duration : Nat;
    price : Nat;
    category : ?Text;
  };

  public type UpdateServiceRequest = {
    name : Text;
    description : Text;
    duration : Nat;
    price : Nat;
    category : ?Text;
  };

  public type DeleteServiceRequest = {
    id : Nat;
  };

  public type GetAllServicesResponse = {
    services : [Service];
  };

  public type GetServicesByArtistResponse = {
    services : [Service];
  };

  public type SearchServicesByCategoryResponse = {
    services : [Service];
  };

  public type GetAvailableTimeSlotsResponse = {
    timeSlots : [Text];
  };

  public type Range = {
    start : Time.Time;
    end : Time.Time;
  };

  public type BookServiceRequest = {
    artistId : Principal;
    serviceId : Nat;
    date : Time.Time;
  };

  public type GetBookingsByCodeResponse = {
    bookings : [Booking];
  };

  public type CalculateTimeRangeRequest = {
    startDate : Time.Time;
    endDate : Time.Time;
    startTime : Text;
    endTime : Text;
  };

  // Service Management

  public shared ({ caller }) func createService(request : CreateServiceRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create services");
    };

    let service : Service = {
      id = nextServiceId;
      artistId = caller;
      name = request.name;
      description = request.description;
      duration = request.duration;
      price = request.price;
      category = request.category;
    };
    services.add(nextServiceId, service);
    nextServiceId += 1;
  };

  public shared ({ caller }) func updateService(id : Nat, request : UpdateServiceRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update services");
    };

    // Verify ownership
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service with ID " # id.toText() # " does not exist") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own services");
        };
      };
    };

    let service : Service = {
      id;
      artistId = caller;
      name = request.name;
      description = request.description;
      duration = request.duration;
      price = request.price;
      category = request.category;
    };
    services.add(id, service);
  };

  public shared ({ caller }) func deleteService(request : DeleteServiceRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete services");
    };

    // Verify ownership
    switch (services.get(request.id)) {
      case (null) { Runtime.trap("Service with ID " # request.id.toText() # " does not exist") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own services");
        };
      };
    };

    services.remove(request.id);
  };

  // Service Queries

  public query ({ caller }) func getAllServices() : async GetAllServicesResponse {
    let array = services.values().toArray();
    { services = array };
  };

  public query ({ caller }) func getServicesByArtist(artistId : Principal) : async GetServicesByArtistResponse {
    let array = services.values().toArray().filter(func(service) { service.artistId == artistId });
    { services = array };
  };

  public query ({ caller }) func searchServicesByCategory(category : Text) : async SearchServicesByCategoryResponse {
    let array = services.values().toArray().filter(func(service) {
      switch (service.category) {
        case (null) { false };
        case (?cat) { cat == category };
      };
    });
    { services = array };
  };

  public query ({ caller }) func getAvailableTimeSlots(_ : Range) : async GetAvailableTimeSlotsResponse {
    let timeSlots = [
      "2023-12-01 10:00",
      "2023-12-01 11:00",
      "2023-12-01 14:00",
      "2023-12-02 09:00",
      "2023-12-02 13:00",
    ];
    { timeSlots };
  };

  // Service Booking

  public type ExtendedBooking = {
    booking : Booking;
    bookerName : Text;
  };

  let extendedBookings = Map.empty<Text, ExtendedBooking>();

  public shared ({ caller }) func bookService(request : BookServiceRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book services");
    };

    let bookingData : Booking = {
      id = request.artistId.toText();
      artistId = request.artistId;
      clientId = caller;
      date = request.date;
      time = "default";
      serviceType = "service";
      duration = 0;
    };

    let extendedBookingData : ExtendedBooking = {
      booking = bookingData;
      bookerName = "default_name";
    };

    extendedBookings.add(request.artistId.toText(), extendedBookingData);
  };

  public query ({ caller }) func getBookingsByCode(_ : Text) : async GetBookingsByCodeResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let array = extendedBookings.values().toArray();
    let bookings = array.map(func(extendedBooking) {
      extendedBooking.booking;
    });
    { bookings };
  };

  // Time Range Calculation

  public shared ({ caller }) func calculateTimeRange(_ : CalculateTimeRangeRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate time ranges");
    };
  };

  // Grant Admin Rights manually
  public shared ({ caller }) func assignAdminPrivileges(adminPrincipal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign admin privileges");
    };
    AccessControl.assignRole(
      accessControlState,
      caller,
      adminPrincipal,
      #admin,
    );
  };
};
