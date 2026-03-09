# Product Requirements Document (PRD): OptiView

## 1. Project Information

* **Project Name:** OptiView

---

## 2. Executive Summary

**OptiView** is an web application designed to demonstrate high-performance image delivery. The system solves the problem of inefficient content loading by serving images tailored to the user's specific screen size, pixel density, and browser format support. The primary goal is to achieve an optimal balance between visual quality and loading speed.

---

## 3. Goals & Objectives

1. **Performance Optimization:** Implement a hybrid image processing system (On-the-fly + Caching).
2. **Adaptive Delivery:** Automate the selection of image formats (AVIF > WebP > JPEG) based on browser capabilities.
3. **Visual Excellence:** Eliminate Cumulative Layout Shift (CLS) using aspect ratio locking and advanced loading states (LQIP + dominant color).
4. **User Engagement:** Provide a smooth interface for filtering, sorting, and viewing high-quality photography with shareable URL states.

---

## 4. Functional Requirements

### 4.1. Core Image Delivery Logic (Primary Focus)

* **REQ-1: Auto-Format Negotiation.** The server must analyze the `Accept` request header to deliver the most efficient format (AVIF > WebP > JPEG).
* **REQ-2: Dynamic Resizing.** The system must generate image versions corresponding to the user's viewport (Mobile/Tablet/Desktop).
* **REQ-3: Hybrid Caching.** First-time requests for a specific size/format trigger generation; subsequent requests serve from the server-side cache.
* **REQ-4: Metadata Extraction.** During upload, the system must calculate the dominant color, aspect ratio, and generate a LQIP (Low Quality Image Placeholder) for loading states.

### 4.2. User Interface & Features

* **REQ-5: Image Gallery.** A responsive masonry grid displaying images with their rating and category.
* **REQ-6: Filtering System.** Users can filter content by:
  * Genre (default categories: Nature, Architecture, Portrait, Uncategorized; users can also add custom genres).
  * Minimum Rating (1-5 stars).
* **REQ-7: Sorting Mechanism.** Users can sort the display by:
  * Date of Creation (Newest/Oldest).
  * Rating (High to Low).
* **REQ-8: Upload Module.** Drag-and-drop interface for users to add new images with:
  * Genre selection per image (default: "Uncategorized").
  * Genre is immutable once set at upload time.
* **REQ-12: Lightbox Modal.** Users can view images in full-screen mode with navigation between images and download options for different sizes (640px, 1280px, 1920px).
* **REQ-13: Quick Upload Access.** A floating action button (FAB) provides quick navigation to the upload page.
* **REQ-14: Rating Update.** Users can update the rating of any image after upload.
  * Rating is a shared/global value - no user attribution.
  * Rating can be changed from both the image card in the gallery and the Lightbox modal.
  * Optimistic UI updates with error rollback.

### 4.3. User Experience (UX)

* **REQ-9: Smart Placeholders.** Show a blurred preview (LQIP) while the high-resolution image is downloading.
* **REQ-10: Aspect Ratio Locking.** Image containers must maintain their height based on the image's aspect ratio to prevent layout jumps.
* **REQ-11: Color-Dominant Background.** Use the pre-calculated dominant color as a background fill before the placeholder appears.

---

## 5. Technical Requirements

### 5.1. Tech Stack

* **Frontend:** React.js with Vite
* **Backend:** Node.js with NestJS framework
* **Database:** PostgreSQL
* **Image Processing:** Sharp library

*(Detailed versions, infrastructure, and data model defined in ADR)*

---

## 6. Constraints & Out of Scope

* **Out of Scope:** User authentication and private profiles (all users are guests/contributors).
* **Out of Scope:** Video content or animated GIFs.
* **Out of Scope:** High-concurrency "Request Collapsing".
* **Out of Scope:** Image editing after upload.
* **Out of Scope:** Genre modification after upload (immutable).
* **Constraint:** Max file size: 10MB per image.
* **Constraint:** Supported input formats: JPEG, PNG, WebP.
* **Constraint:** Default rating for new uploads: 3 (of 5).
* **Constraint:** The application must be optimized for modern browsers (Chrome, Firefox, Safari, Edge).

---

## 7. Success Metrics

* **Google Lighthouse Score:** 90+ in the "Performance" category.
* **Format Efficiency:** 100% of supported requests served as AVIF or WebP.
* **Zero Layout Shift:** Visual stability during image transition from placeholder to full resolution.
