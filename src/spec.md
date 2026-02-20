# Specification

## Summary
**Goal:** Add a music library feature where artists can upload songs for sale, and enhance bulk image upload with metadata fields (category, subcategory, price, description).

**Planned changes:**
- Add Music data type in backend with audio blob storage and metadata fields
- Create backend methods for music CRUD operations (create, get all, get by ID, update, delete)
- Build MusicLibraryPage component displaying music in grid layout with audio preview and purchase options
- Add music upload dialog for authenticated artists with file selection and metadata inputs
- Add /music route and navigation link in header
- Create React Query hooks for music operations following existing patterns
- Update cart functionality to support music items alongside products and gigs
- Enhance BulkImageUpload component with category dropdown, subcategory input, price field, and description textarea for each image
- Update bulk upload logic to pass all metadata to backend when creating products
- Add subcategory field to Product data type in backend

**User-visible outcome:** Artists can upload songs to a music library where buyers can preview and purchase recordings. The music library is accessible via a new navigation link. When bulk uploading product images, users can now specify category, subcategory, price, and description for each image before creating products.
