import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";

// No migration needed due to missing persistent state changes
actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();

  // Include AuthorizationMixin
  include MixinAuthorization(accessControlState);

  // Include storage mixin
  include MixinStorage();

  public query ({ caller }) func isAdmin() : async Bool {
    // This principal is hardcoded in main.tsx and cannot be changed 
    caller == Principal.fromText("gwnln-jmtc7-rdrpt-tzrrg-cygwh-k27i2-hlppl-3v4wb-holfc-ezwwn-3qe");
  };

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

  // Artist Revenue Tracking
  public type ArtistRevenue = {
    artistId : Principal;
    totalRevenue : Nat;
    pendingRevenue : Nat;
    paidRevenue : Nat;
  };

  let artistRevenues = Map.empty<Principal, ArtistRevenue>();

  // Payment Transaction History
  public type PaymentTransaction = {
    id : Text;
    buyerId : Principal;
    artistId : Principal;
    productId : Text;
    amount : Nat;
    artistShare : Nat;
    platformFee : Nat;
    timestamp : Time.Time;
    transactionType : { #productSale; #donation };
  };

  let paymentTransactions = Map.empty<Text, PaymentTransaction>();
  var nextTransactionId : Nat = 0;

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

  public type UpdateArtistProfileRequest = {
    bio : Text;
    skills : [Text];
    contactInfo : Text;
    portfolioImages : [Storage.ExternalBlob];
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

        // Initialize artist revenue tracking
        let revenue : ArtistRevenue = {
          artistId = caller;
          totalRevenue = 0;
          pendingRevenue = 0;
          paidRevenue = 0;
        };
        artistRevenues.add(caller, revenue);

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

  public shared ({ caller }) func updateArtistProfile(request : UpdateArtistProfileRequest) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update artist profiles");
    };

    let currentProfile = switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Artist profile not found. Please create a profile first.");
      };
      case (?profile) { profile };
    };

    // Ensure legacy data migrates to new structure
    let updatedProfile : ArtistProfile = {
      id = currentProfile.id;
      bio = request.bio;
      skills = request.skills;
      contactInfo = request.contactInfo;
      portfolioImages = request.portfolioImages;
    };

    profiles.add(caller, updatedProfile);
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
  public shared ({ caller }) func updateGig(gig : Gig) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    let array = bookings.values().toArray();

    // Admins can see all bookings
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return array;
    };

    // Regular users can only see bookings where they are involved
    array.filter(func(booking) {
      booking.clientId == caller or booking.artistId == caller;
    });
  };

  public query ({ caller }) func findBookingsByDate() : async [Booking] {
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
    let array = bookings.values().toArray();
    let filtered = array.filter(func(booking) {
      booking.artistId == artistId;
    });

    // Admins and the artist can see all their bookings
    if (AccessControl.isAdmin(accessControlState, caller) or caller == artistId) {
      return filtered;
    };

    // Other users can only see bookings where they are the client
    filtered.filter(func(booking) {
      booking.clientId == caller;
    });
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

    // Verify ownership and preserve original artistId
    let originalArtistId = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own products");
        };
        existing.artistId;
      };
    };

    let product = {
      id;
      artistId = originalArtistId;
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
    artistRevenueSharePercentage : Nat;
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
    artistRevenueSharePercentage = 90; // Artists get 90% by default (10% platform commission)
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
    artistRevenueSharePercentage = 90; // Artists get 90% by default (10% platform commission)
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
    filterOptions : [StoreProductFilter],
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
      filterOptions;
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

  public shared ({ caller }) func setPlatformCommissionRate(commissionPercentage : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update commission rate");
    };

    if (commissionPercentage > 100) {
      Runtime.trap("Invalid commission percentage: Must be between 0 and 100");
    };

    let artistShare = 100 - commissionPercentage;

    storeConfig := {
      storeConfig with
      artistRevenueSharePercentage = artistShare;
    };
  };

  public shared ({ caller }) func setArtistRevenueSharePercentage(percentage : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update revenue share percentage");
    };

    if (percentage > 100) {
      Runtime.trap("Invalid percentage: Must be between 0 and 100");
    };

    storeConfig := {
      storeConfig with
      artistRevenueSharePercentage = percentage;
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

    // Verify ownership and preserve original artistId
    let originalArtistId = switch (services.get(id)) {
      case (null) { Runtime.trap("Service with ID " # id.toText() # " does not exist") };
      case (?existing) {
        if (existing.artistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own services");
        };
        existing.artistId;
      };
    };

    let service : Service = {
      id;
      artistId = originalArtistId;
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
    let array = extendedBookings.values().toArray();

    // Filter bookings based on caller permissions
    let filteredArray = if (AccessControl.isAdmin(accessControlState, caller)) {
      array;
    } else {
      array.filter(func(extendedBooking) {
        let booking = extendedBooking.booking;
        booking.clientId == caller or booking.artistId == caller;
      });
    };

    let bookings = filteredArray.map(func(extendedBooking) {
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

  // Artist Revenue Management

  public query ({ caller }) func getArtistRevenue(artistId : Principal) : async ArtistRevenue {
    // Only the artist themselves or admins can view revenue
    if (caller != artistId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own revenue");
    };

    switch (artistRevenues.get(artistId)) {
      case (null) {
        {
          artistId;
          totalRevenue = 0;
          pendingRevenue = 0;
          paidRevenue = 0;
        };
      };
      case (?revenue) { revenue };
    };
  };

  public query ({ caller }) func getPaymentTransactionHistory(artistId : Principal) : async [PaymentTransaction] {
    // Only the artist themselves or admins can view transaction history
    if (caller != artistId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transaction history");
    };

    let array = paymentTransactions.values().toArray();
    array.filter(func(transaction) {
      transaction.artistId == artistId;
    });
  };

  // Admin Dashboard Functions

  public type PlatformRevenueMetrics = {
    totalPlatformRevenue : Nat;
    totalArtistPayouts : Nat;
    totalTransactions : Nat;
    averageTransactionValue : Nat;
  };

  public query ({ caller }) func getPlatformRevenueMetrics() : async PlatformRevenueMetrics {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view platform revenue metrics");
    };

    let transactions = paymentTransactions.values().toArray();
    var totalPlatformRevenue : Nat = 0;
    var totalArtistPayouts : Nat = 0;
    var totalAmount : Nat = 0;

    for (transaction in transactions.vals()) {
      totalPlatformRevenue += transaction.platformFee;
      totalArtistPayouts += transaction.artistShare;
      totalAmount += transaction.amount;
    };

    let totalTransactions = transactions.size();
    let averageTransactionValue = if (totalTransactions > 0) {
      totalAmount / totalTransactions;
    } else {
      0;
    };

    {
      totalPlatformRevenue;
      totalArtistPayouts;
      totalTransactions;
      averageTransactionValue;
    };
  };

  public query ({ caller }) func getAllArtistRevenues() : async [ArtistRevenue] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all artist revenues");
    };

    artistRevenues.values().toArray();
  };

  public query ({ caller }) func getAllPaymentTransactions() : async [PaymentTransaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all payment transactions");
    };

    paymentTransactions.values().toArray();
  };

  public type UserInfo = {
    principal : Principal;
    role : AccessControl.UserRole;
    hasArtistProfile : Bool;
    totalRevenue : Nat;
  };

  public query ({ caller }) func getAllUsers() : async [UserInfo] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    // Get all unique principals from various sources
    let artistPrincipals = profiles.keys().toArray();
    let jobEmployers = jobOfferings.values().toArray().map(func(job : JobOffering) : Principal { job.employer });
    let gigArtists = gigs.values().toArray().map(func(gig : Gig) : Principal { gig.artistId });
    
    // Combine and deduplicate principals
    let allPrincipals = artistPrincipals.concat(jobEmployers).concat(gigArtists);
    
    // Create user info for each principal
    let userInfos = allPrincipals.map(func(principal : Principal) : UserInfo {
      let role = AccessControl.getUserRole(accessControlState, principal);
      let hasArtistProfile = profiles.get(principal) != null;
      let revenue = switch (artistRevenues.get(principal)) {
        case (null) { 0 };
        case (?rev) { rev.totalRevenue };
      };
      
      {
        principal;
        role;
        hasArtistProfile;
        totalRevenue = revenue;
      };
    });

    userInfos;
  };

  public type SiteBranding = {
    siteName : Text;
    logoUrl : Text;
    primaryColor : Text;
    secondaryColor : Text;
    description : Text;
  };

  var siteBranding : SiteBranding = {
    siteName = "Artist Platform";
    logoUrl = "";
    primaryColor = "#000000";
    secondaryColor = "#FFFFFF";
    description = "A platform for artists and clients";
  };

  public query ({ caller }) func getSiteBranding() : async SiteBranding {
    siteBranding;
  };

  public shared ({ caller }) func updateSiteBranding(branding : SiteBranding) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update site branding");
    };

    siteBranding := branding;
  };

  // Helper function to calculate artist share
  func calculateArtistShare(amount : Nat) : (Nat, Nat) {
    if (amount == 0) {
      return (0, 0);
    };
    let artistShare = (amount * storeConfig.artistRevenueSharePercentage) / 100;
    let platformFee = amount - artistShare;
    (artistShare, platformFee);
  };

  // Helper function to record payment transaction
  func recordPaymentTransaction(
    buyerId : Principal,
    artistId : Principal,
    productId : Text,
    amount : Nat,
    transactionType : { #productSale; #donation }
  ) : () {
    let (artistShare, platformFee) = calculateArtistShare(amount);

    let transaction : PaymentTransaction = {
      id = nextTransactionId.toText();
      buyerId;
      artistId;
      productId;
      amount;
      artistShare;
      platformFee;
      timestamp = Time.now();
      transactionType;
    };

    paymentTransactions.add(nextTransactionId.toText(), transaction);
    nextTransactionId += 1;

    // Update artist revenue
    let currentRevenue = switch (artistRevenues.get(artistId)) {
      case (null) {
        {
          artistId;
          totalRevenue = 0;
          pendingRevenue = 0;
          paidRevenue = 0;
        };
      };
      case (?revenue) { revenue };
    };

    let updatedRevenue : ArtistRevenue = {
      artistId;
      totalRevenue = currentRevenue.totalRevenue + artistShare;
      pendingRevenue = currentRevenue.pendingRevenue + artistShare;
      paidRevenue = currentRevenue.paidRevenue;
    };

    artistRevenues.add(artistId, updatedRevenue);
  };

  // New Stripe Functionality with Revenue Sharing

  public shared ({ caller }) func checkoutAndPayProduct(productId : Text, successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?value) { value };
    };

    // Verify the artist exists and has a valid profile
    ignore switch (profiles.get(product.artistId)) {
      case (null) { Runtime.trap("Artist profile not found for this product") };
      case (?_artist) {  };
    };

    let stripeItem : Stripe.ShoppingItem = {
      currency = "USD";
      productName = product.title;
      productDescription = product.description;
      priceInCents = product.price;
      quantity = 1;
    };

    // Record the transaction for revenue sharing
    recordPaymentTransaction(caller, product.artistId, productId, product.price, #productSale);

    await Stripe.createCheckoutSession(getStripeConfig(), caller, [stripeItem], successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func donateToArtist(artistId : Principal, amount : Nat, successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can donate to artists");
    };

    // Verify the artist exists and has a valid profile
    ignore switch (profiles.get(artistId)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?_artist) {  };
    };

    // Verify the artist is a registered user (not just a guest)
    if (not (AccessControl.hasPermission(accessControlState, artistId, #user))) {
      Runtime.trap("Invalid artist: Artist must be a registered user");
    };

    if (amount == 0) {
      Runtime.trap("Invalid donation amount: Must be greater than 0");
    };

    let donationItem : Stripe.ShoppingItem = {
      currency = "USD";
      productName = "Artist Donation";
      productDescription = "Donation for artist " # artistId.toText();
      priceInCents = amount;
      quantity = 1;
    };

    // Record the donation transaction (donations go 100% to artist)
    recordPaymentTransaction(caller, artistId, "donation", amount, #donation);

    await Stripe.createCheckoutSession(getStripeConfig(), caller, [donationItem], successUrl, cancelUrl, transform);
  };

  // User Profile Management (Required by frontend)
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
