# Detailed Implementation Plan: Stage 4 - Frontend Setup

## Overview

This document provides a detailed implementation plan for **Stage 4: Frontend Setup** of the OptiView project. This stage focuses on configuring the frontend application with TypeScript types generated from OpenAPI specification, API client implementation, TanStack Query setup, and React Router configuration.

**Key Decision:** Types are generated from backend OpenAPI specification using `openapi-typescript`. API client and React Query hooks are implemented manually for full control over:
- Caching strategies
- Optimistic updates
- File upload with progress tracking
- Error handling

**Prerequisites:**

- Stage 0: Infrastructure Setup - ✅ Completed
- Frontend template exists at `/frontend` with React 19 + Vite 7 + TypeScript 5 + Tailwind CSS 4 + Flowbite React
- Backend running with Swagger/OpenAPI at `http://localhost:3000/api/docs`

---

## 1. Current State Analysis

### 1.1 Frontend Template Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main app component (placeholder)
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind CSS imports
├── package.json         # Dependencies (React, Flowbite, Tailwind)
├── vite.config.ts       # Vite config with @ alias
└── tsconfig.*.json      # TypeScript configs
```

### 1.2 Existing Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | React DOM rendering |
| flowbite-react | 0.12.10 | UI component library |
| tailwindcss | 4.1.17 | CSS framework |
| vite | 7.2.4 | Build tool |

### 1.3 Required New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | 5.x | Server state management |
| @tanstack/react-query-devtools | 5.x | DevTools for React Query |
| react-router-dom | 7.x | SPA routing |
| openapi-typescript | ^7.x | Type generation from OpenAPI (dev dependency) |

---

## 2. Code Generation Strategy

### 2.1 Why Hybrid Approach?

Instead of manually duplicating types or using full code generation (like Orval), we use a **hybrid approach**:

```mermaid
flowchart LR
    Backend[NestJS Backend] -->|Swagger JSON| Spec[OpenAPI Spec /api/docs-json]
    Spec -->|openapi-typescript| Types[Generated Types]
    Types --> |type imports| Client[Custom API Client]
    Client --> Hooks[Custom React Query Hooks]
    Hooks --> Components[React Components]
```

**Benefits:**
- ✅ Types always in sync with backend
- ✅ Full control over hook implementations
- ✅ Optimistic updates for rating
- ✅ File upload with progress tracking
- ✅ Minimal bundle size (only type imports)

### 2.2 Types Generation Workflow

1. **Development:** Backend must be running at `localhost:3000`
2. **Generate:** Run `npm run generate:types` to fetch OpenAPI spec and generate types
3. **Commit:** Generated file `src/api/schema.gen.ts` is committed to git
4. **Update:** Regenerate manually when backend API changes

---

## 3. Implementation Architecture

### 3.1 Directory Structure (Target)

```
frontend/
├── src/
│   ├── api/
│   │   ├── schema.gen.ts         # Generated types from OpenAPI
│   │   ├── client.ts             # Base API client with error handling
│   │   ├── images.api.ts         # Images API methods
│   │   └── index.ts              # API barrel export
│   ├── hooks/
│   │   ├── useImages.ts          # TanStack Query hooks for images
│   │   └── index.ts              # Hooks barrel export
│   ├── App.tsx                   # Router setup
│   ├── main.tsx                  # QueryClient provider
│   └── index.css
├── .env                          # API base URL
├── package.json                  # Scripts for type generation
└── orval.config.ts               # Reserved for future if needed
```

### 3.2 Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend [React Application]
        UI[UI Components]
        Hooks[TanStack Query Hooks]
        API[API Client]
        GenTypes[Generated Types]
    end

    subgraph State [State Management]
        QC[QueryClient]
        Cache[Query Cache]
    end

    subgraph Routing [React Router]
        Router[BrowserRouter]
        Routes[Routes]
    end

    UI --> Hooks
    Hooks --> QC
    QC --> Cache
    Hooks --> API
    API --> GenTypes
    Router --> Routes
    Routes --> UI

    API -->|HTTP| Backend[Backend API]
    Backend -->|OpenAPI JSON| GenTypes
```

### 3.3 Type Usage Pattern

Generated types are accessed via `components['schemas']` path:

```typescript
import type { components } from '@/api/schema.gen';

// Extract types for use in application
type Image = components['schemas']['Image'];
type ImageFilterDto = components['schemas']['ImageFilterDto'];
type PaginatedResponseImage = components['schemas']['PaginatedResponseDto'];
```

---

## 4. Detailed Task Breakdown

### Task 4.1: Install Dependencies

**Goal:** Add all required dependencies for the frontend setup.

**Commands:**

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools react-router-dom
npm install -D openapi-typescript
```

**Verification:**
- Check `package.json` contains new dependencies
- Run `npm run dev` to verify no import errors

**Files Modified:**
- `frontend/package.json`
- `frontend/package-lock.json`

---

### Task 4.2: Configure Environment Variables

**Goal:** Set up environment configuration for API base URL.

**Create File:**

#### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Usage in Code:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**Notes:**
- Vite requires `VITE_` prefix for exposed environment variables
- Access via `import.meta.env.VITE_*`
- `.env` should be added to `.gitignore` if it contains sensitive data (not needed for this MVP)

---

### Task 4.3: Add Type Generation Script

**Goal:** Configure npm script to generate types from OpenAPI spec.

**Modify `frontend/package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "generate:types": "openapi-typescript http://localhost:3000/api/docs-json -o ./src/api/schema.gen.ts"
  }
}
```

**Usage:**

```bash
# Make sure backend is running first
npm run generate:types
```

**Notes:**
- Backend must be running at `localhost:3000`
- Generated file is committed to git
- Regenerate when backend API changes

---

### Task 4.4: Generate Types from OpenAPI

**Goal:** Generate TypeScript types from backend OpenAPI specification.

**Prerequisites:**
- Backend running at `http://localhost:3000`
- Swagger endpoint accessible at `/api/docs-json`

**Command:**

```bash
cd frontend
npm run generate:types
```

**Generated File:**

#### `frontend/src/api/schema.gen.ts`

This file is auto-generated and should not be edited manually. Example structure:

```typescript
/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct modifications to the file.
 */

export interface paths {
  '/api/images': {
    get: {
      parameters: {
        query?: {
          genre?: components['schemas']['Genre'];
          rating?: number;
          sort?: 'createdAt' | 'rating' | 'filename';
          sortOrder?: 'ASC' | 'DESC';
          page?: number;
          pageSize?: number;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['PaginatedResponseDto'];
          };
        };
      };
    };
  };
  // ... other endpoints
}

export interface components {
  schemas: {
    Image: {
      id: string;
      filename: string;
      genre: components['schemas']['Genre'];
      rating: number;
      aspectRatio: number;
      dominantColor: string;
      lqipBase64: string;
      width: number;
      height: number;
      createdAt: string;
    };
    Genre: 'Nature' | 'Architecture' | 'Portrait' | 'Uncategorized';
    // ... other schemas
  };
}
```

---

### Task 4.5: Create Type Re-exports

**Goal:** Create convenient type aliases for commonly used types.

#### `frontend/src/api/types.ts`

```typescript
/**
 * Re-exported types from generated schema for convenience.
 * These provide cleaner imports throughout the application.
 */
import type { components } from './schema.gen';

// Entity types
export type Image = components['schemas']['Image'];
export type Genre = components['schemas']['Genre'];

// DTO types
export type ImageFilterDto = components['schemas']['ImageFilterDto'];
export type CreateImageDto = components['schemas']['CreateImageDto'];
export type UpdateRatingDto = components['schemas']['UpdateRatingDto'];
export type RatingUpdateResponseDto = components['schemas']['RatingUpdateResponseDto'];
export type LqipResponseDto = components['schemas']['LqipResponseDto'];

// Response types
export type PaginatedResponseDto = components['schemas']['PaginatedResponseDto'];

// Extract pagination metadata from paginated response
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Sort field type (derived from ImageFilterDto)
export type SortField = 'createdAt' | 'rating' | 'filename';
export type SortOrder = 'ASC' | 'DESC';

/**
 * API error response structure.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
```

---

### Task 4.6: Create API Client

**Goal:** Create a centralized API client with base URL configuration and error handling.

#### `frontend/src/api/client.ts`

```typescript
/**
 * API client configuration for backend communication.
 * Uses native fetch API for HTTP requests.
 */
import type { ApiErrorResponse } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Default headers for API requests.
 */
const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handles API error responses.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let errorData: ApiErrorResponse | undefined;
  try {
    errorData = await response.json();
  } catch {
    // Ignore JSON parsing errors
  }
  throw new ApiError(
    response.status,
    errorData?.message || response.statusText,
    errorData,
  );
}

/**
 * Makes a GET request to the API.
 */
export async function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: defaultHeaders,
    ...options,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * Makes a POST request to the API.
 */
export async function apiPost<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * Makes a PATCH request to the API.
 */
export async function apiPatch<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify(body),
    ...options,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * Makes a DELETE request to the API.
 */
export async function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: defaultHeaders,
    ...options,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}

/**
 * Makes a multipart form POST request for file uploads.
 */
export async function apiUpload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
  // Don't set Content-Type for FormData - browser sets it with boundary
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    ...options,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return response.json();
}
```

---

### Task 4.7: Create Images API Methods

**Goal:** Implement typed API methods for all image endpoints using generated types.

#### `frontend/src/api/images.api.ts`

```typescript
import { apiGet, apiPatch, apiUpload, API_BASE_URL } from './client';
import type {
  Image,
  ImageFilterDto,
  PaginatedResponseDto,
  UpdateRatingDto,
  RatingUpdateResponseDto,
  Genre,
} from './types';

/**
 * Images API endpoints.
 */
const ENDPOINTS = {
  IMAGES: '/api/images',
  IMAGE_BY_ID: (id: string) => `/api/images/${id}`,
  IMAGE_METADATA: (id: string) => `/api/images/${id}/metadata`,
  IMAGE_LQIP: (id: string) => `/api/images/${id}/lqip`,
  IMAGE_RATING: (id: string) => `/api/images/${id}/rating`,
  UPLOAD: '/api/images/upload',
} as const;

/**
 * Builds query string from filter parameters.
 */
function buildQueryString(filters: ImageFilterDto): string {
  const params = new URLSearchParams();

  if (filters.genre) params.append('genre', filters.genre);
  if (filters.rating !== undefined) params.append('rating', filters.rating.toString());
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.pageSize !== undefined) params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetches paginated list of images with optional filters.
 */
export async function getImages(filters: ImageFilterDto = {}): Promise<PaginatedResponseDto> {
  const queryString = buildQueryString(filters);
  return apiGet<PaginatedResponseDto>(`${ENDPOINTS.IMAGES}${queryString}`);
}

/**
 * Fetches single image metadata by ID.
 */
export async function getImageMetadata(id: string): Promise<Image> {
  return apiGet<Image>(ENDPOINTS.IMAGE_METADATA(id));
}

/**
 * Gets the URL for a processed image with specified width.
 * The browser's Accept header determines the format (AVIF/WebP/JPEG).
 */
export function getImageUrl(id: string, width: number): string {
  return `${API_BASE_URL}${ENDPOINTS.IMAGE_BY_ID(id)}?width=${width}`;
}

/**
 * Gets the URL for the LQIP placeholder.
 */
export function getLqipUrl(id: string): string {
  return `${API_BASE_URL}${ENDPOINTS.IMAGE_LQIP(id)}`;
}

/**
 * Updates the rating for an image.
 */
export async function updateImageRating(id: string, rating: number): Promise<RatingUpdateResponseDto> {
  const body: UpdateRatingDto = { rating };
  return apiPatch<RatingUpdateResponseDto>(ENDPOINTS.IMAGE_RATING(id), body);
}

/**
 * Uploads a new image with genre selection.
 * Supports progress tracking via callback.
 */
export async function uploadImage(
  file: File,
  genre: Genre,
  onProgress?: (progress: number) => void,
): Promise<Image> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('genre', genre);

  // For progress tracking, we need XMLHttpRequest
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.open('POST', `${API_BASE_URL}${ENDPOINTS.UPLOAD}`);
      xhr.send(formData);
    });
  }

  return apiUpload<Image>(ENDPOINTS.UPLOAD, formData);
}
```

#### `frontend/src/api/index.ts`

```typescript
// Generated types
export * from './types';

// API client
export * from './client';

// API methods
export * from './images.api';
```

---

### Task 4.8: Create TanStack Query Hooks

**Goal:** Implement React Query hooks for data fetching with caching and optimistic updates.

#### `frontend/src/hooks/useImages.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as imagesApi from '@/api/images.api';
import type { ImageFilterDto, Image } from '@/api';

/**
 * Query keys for TanStack Query cache management.
 */
export const queryKeys = {
  images: (filters: ImageFilterDto) => ['images', filters] as const,
  image: (id: string) => ['image', id] as const,
  imageMetadata: (id: string) => ['imageMetadata', id] as const,
} as const;

/**
 * Hook for fetching paginated images with filters.
 * Automatically refetches when filters change.
 */
export function useImages(filters: ImageFilterDto = {}) {
  return useQuery({
    queryKey: queryKeys.images(filters),
    queryFn: () => imagesApi.getImages(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for fetching single image metadata.
 */
export function useImageMetadata(id: string) {
  return useQuery({
    queryKey: queryKeys.imageMetadata(id),
    queryFn: () => imagesApi.getImageMetadata(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for updating image rating with optimistic updates.
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      imagesApi.updateImageRating(id, rating),

    // Optimistic update
    onMutate: async ({ id, rating }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.imageMetadata(id) });

      // Snapshot previous value
      const previousImage = queryClient.getQueryData<Image>(queryKeys.imageMetadata(id));

      // Optimistically update
      if (previousImage) {
        queryClient.setQueryData<Image>(queryKeys.imageMetadata(id), {
          ...previousImage,
          rating,
        });
      }

      return { previousImage };
    },

    // Revert on error
    onError: (err, { id }, context) => {
      if (context?.previousImage) {
        queryClient.setQueryData(queryKeys.imageMetadata(id), context.previousImage);
      }
      console.error('Failed to update rating:', err);
    },

    // Refetch after settling
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.imageMetadata(id) });
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}

/**
 * Hook for uploading images.
 * Progress is handled via callback in the API function.
 */
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      genre,
      onProgress,
    }: {
      file: File;
      genre: Parameters<typeof imagesApi.uploadImage>[1];
      onProgress?: (progress: number) => void;
    }) => imagesApi.uploadImage(file, genre, onProgress),

    onSuccess: () => {
      // Invalidate images list to show new upload
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}

/**
 * Helper hook to get image URL with proper format negotiation.
 * Returns URL that can be used in img src attribute.
 */
export function useImageUrl(id: string, width: number) {
  return imagesApi.getImageUrl(id, width);
}

/**
 * Helper hook to get LQIP URL.
 */
export function useLqipUrl(id: string) {
  return imagesApi.getLqipUrl(id);
}
```

#### `frontend/src/hooks/index.ts`

```typescript
export * from './useImages';
```

---

### Task 4.9: Set Up React Router

**Goal:** Configure React Router with application routes.

#### Updated `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Placeholder components - will be implemented in Stage 5 and 6
function GalleryPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Gallery Page</h1>
      <p className="text-gray-600">Gallery feature will be implemented in Stage 5</p>
    </div>
  );
}

function UploadPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Upload Page</h1>
      <p className="text-gray-600">Upload feature will be implemented in Stage 6</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### Task 4.10: Configure TanStack Query Provider

**Goal:** Set up QueryClient with development tools.

#### Updated `frontend/src/main.tsx`

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App';

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
```

---

## 5. File Creation Summary

| File | Action | Description |
|------|--------|-------------|
| `frontend/.env` | Create | Environment variables |
| `frontend/src/api/schema.gen.ts` | Generate | Auto-generated types from OpenAPI |
| `frontend/src/api/types.ts` | Create | Convenient type re-exports |
| `frontend/src/api/client.ts` | Create | API client with fetch |
| `frontend/src/api/images.api.ts` | Create | Images API methods |
| `frontend/src/api/index.ts` | Create | API barrel export |
| `frontend/src/hooks/useImages.ts` | Create | TanStack Query hooks |
| `frontend/src/hooks/index.ts` | Create | Hooks barrel export |
| `frontend/src/App.tsx` | Modify | Add React Router |
| `frontend/src/main.tsx` | Modify | Add QueryClient provider |
| `frontend/package.json` | Modify | Add dependencies and scripts |

---

## 6. Dependencies to Install

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools react-router-dom
npm install -D openapi-typescript
```

---

## 7. NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "generate:types": "openapi-typescript http://localhost:3000/api/docs-json -o ./src/api/schema.gen.ts"
  }
}
```

---

## 8. Verification Checklist

### 8.1 Installation Verification

- [ ] `npm run dev` starts without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings

### 8.2 Type Generation Verification

- [ ] `npm run generate:types` runs successfully
- [ ] `src/api/schema.gen.ts` file is created
- [ ] Types can be imported in other files

### 8.3 API Client Verification

- [ ] API client connects to backend (check Network tab)
- [ ] Environment variable is properly read
- [ ] Error handling works correctly

### 8.4 Router Verification

- [ ] `/` route shows Gallery placeholder
- [ ] `/upload` route shows Upload placeholder
- [ ] Browser back/forward navigation works

### 8.5 TanStack Query Verification

- [ ] React Query DevTools appear in development
- [ ] Query hooks return typed data
- [ ] Cache is properly populated

---

## 9. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend not running when generating types | Medium | Low | Document prerequisite; add error message in script |
| OpenAPI spec changes break generated types | Low | Medium | Regenerate types when backend changes; TypeScript catches issues |
| Type mismatch after API changes | Low | Medium | Regenerate types; CI can verify types are up-to-date |
| React 19 compatibility with TanStack Query | Low | High | Use TanStack Query 5.x which supports React 19 |

---

## 10. Next Steps After Stage 4

Once Stage 4 is complete, the following stages can begin:

1. **Stage 5: Frontend Gallery Feature**
   - Uses `useImages` hook for data
   - Uses `useUpdateRating` for rating interaction
   - Uses router for navigation

2. **Stage 6: Frontend Upload Feature**
   - Uses `useUploadImage` hook
   - Uses `/upload` route

Both Stage 5 and Stage 6 depend on Stage 4 being complete, but they can run in parallel.

---

## 11. Implementation Order

The recommended order for implementing tasks:

```mermaid
flowchart LR
    T1[4.1 Install Dependencies] --> T2[4.2 Environment Variables]
    T2 --> T3[4.3 Add Type Generation Script]
    T3 --> T4[4.4 Generate Types]
    T4 --> T5[4.5 Create Type Re-exports]
    T5 --> T6[4.6 Create API Client]
    T6 --> T7[4.7 Create Images API]
    T7 --> T8[4.8 Create TanStack Hooks]
    T8 --> T9[4.9 Set Up React Router]
    T9 --> T10[4.10 QueryClient Provider]
    T10 --> T11[Verification]
```

---

## 12. Acceptance Criteria

- [ ] Frontend starts with `npm run dev`
- [ ] Types can be generated from OpenAPI spec with `npm run generate:types`
- [ ] Generated types are properly typed and importable
- [ ] API client successfully connects to backend
- [ ] TanStack Query hooks return typed data
- [ ] Router navigates between `/` and `/upload`
- [ ] Environment configuration allows easy API URL changes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] React Query DevTools available in development mode
- [ ] `schema.gen.ts` is committed to git
