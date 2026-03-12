# Detailed Implementation Plan: Stage 4 - Frontend Setup

## Overview

This document provides a detailed implementation plan for **Stage 4: Frontend Setup** of the OptiView project. This stage focuses on configuring the frontend application with TypeScript types generated from OpenAPI specification, API client implementation using `openapi-fetch`, TanStack Query setup, and React Router configuration.

**Key Decision:** Types are generated from backend OpenAPI specification using `openapi-typescript`. API client uses `openapi-fetch` for type-safe HTTP operations with:
- Automatic type inference for all API calls
- Full autocomplete for endpoints and parameters
- Custom upload function for file uploads with progress tracking
- Custom React Query hooks for caching and optimistic updates

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
| openapi-fetch | ^0.13.x | Type-safe fetch client for OpenAPI |
| openapi-typescript | ^7.x | Type generation from OpenAPI (dev dependency) |
| axios | ^1.x | HTTP client with upload progress support |

---

## 2. Code Generation Strategy

### 2.1 Why openapi-fetch Hybrid Approach?

Instead of manually creating API methods or using full code generation (like Orval), we use a **hybrid approach with openapi-fetch**:

```mermaid
flowchart LR
    Backend[NestJS Backend] -->|Swagger JSON| Spec[OpenAPI Spec /api/docs-json]
    Spec -->|openapi-typescript| Types[Generated Types paths and schemas]
    Types -->|type arg| FetchClient[openapi-fetch client]
    FetchClient --> Hooks[Custom React Query Hooks]

    subgraph Custom[Custom Functions]
        Upload[uploadImage with axios progress]
    end

    Hooks --> Components[React Components]
    Custom --> Hooks
```

**Benefits:**
- ✅ Types always in sync with backend
- ✅ Automatic type inference for all API calls
- ✅ Full autocomplete for endpoints and parameters
- ✅ Less boilerplate - no manual API methods needed
- ✅ Custom upload function with axios progress tracking
- ✅ Custom React Query hooks with optimistic updates
- ✅ Minimal bundle size (openapi-fetch is ~3KB gzipped)

### 2.2 Types Generation Workflow

1. **Development:** Backend must be running at `localhost:3000`
2. **Generate:** Run `npm run gen` to fetch OpenAPI spec and generate types
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
│   │   ├── client.ts             # openapi-fetch client + ApiError class
│   │   ├── images.api.ts         # Only uploadImage (custom with progress)
│   │   └── index.ts              # API barrel export
│   ├── hooks/
│   │   ├── useImages.ts          # TanStack Query hooks for images
│   │   └── index.ts              # Hooks barrel export
│   ├── App.tsx                   # Router setup
│   ├── main.tsx                  # QueryClient provider
│   └── index.css
├── .env                          # API base URL
└── package.json                  # Scripts for type generation
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
npm install @tanstack/react-query @tanstack/react-query-devtools react-router-dom openapi-fetch axios
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
    "gen": "openapi-typescript http://localhost:3000/api/docs-json -o ./src/api/schema.gen.ts"
  }
}
```

**Usage:**

```bash
# Make sure backend is running first
npm run gen
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
npm run gen
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

**Goal:** Create a type-safe API client using openapi-fetch with base URL configuration and error handling.

#### `frontend/src/api/client.ts`

```typescript
/**
 * API client configuration for backend communication.
 * Uses openapi-fetch for type-safe HTTP requests.
 */
import createFetchClient from 'openapi-fetch';
import type { paths, components } from './schema.gen';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Type-safe openapi-fetch client.
 * Provides autocomplete for all API endpoints and full type inference.
 */
export const client = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Error response type from the API.
 */
type ApiErrorResponse = components['schemas']['ApiErrorResponse'];

/**
 * Custom error class for API errors.
 * Includes the HTTP status code and any error details from the server.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type guard to check if an error response is an ApiErrorResponse.
 */
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

/**
 * Helper to throw ApiError from openapi-fetch error response.
 */
export function throwApiError(error: unknown): never {
  if (isApiErrorResponse(error)) {
    throw new ApiError(error.statusCode, error.message, error);
  }
  throw new ApiError(500, 'An unexpected error occurred');
}

/**
 * Helper to get image URL for src attribute.
 * The browser's Accept header determines the format (AVIF/WebP/JPEG).
 */
export function getImageUrl(id: string, width: number): string {
  return `${API_BASE_URL}/api/images/${id}?width=${width}`;
}

/**
 * Helper to get LQIP placeholder URL.
 */
export function getLqipUrl(id: string): string {
  return `${API_BASE_URL}/api/images/${id}/lqip`;
}
```

---

### Task 4.7: Create Custom Upload Function

**Goal:** Implement a custom upload function with axios progress tracking. All other API operations use `openapi-fetch` client directly in hooks.

**Note:** With `openapi-fetch`, there's no need to create wrapper functions for standard GET/PATCH/POST operations. The client provides type-safe access to all endpoints directly. The only custom function needed is `uploadImage` for progress tracking. Axios is used instead of XMLHttpRequest for cleaner, more readable code.

#### `frontend/src/api/images.api.ts`

```typescript
/**
 * Custom image upload function with progress tracking.
 * Uses axios for upload progress tracking with cleaner API than raw XMLHttpRequest.
 */
import axios from 'axios';
import { API_BASE_URL } from './client';
import type { Image, Genre } from './types';

/**
 * Upload endpoint path.
 */
const UPLOAD_ENDPOINT = '/api/images/upload';

/**
 * Uploads a new image with genre selection.
 * Supports progress tracking via callback using axios onUploadProgress.
 *
 * @param file - The image file to upload
 * @param genre - The genre category for the image
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to the created Image entity
 */
export async function uploadImage(
  file: File,
  genre: Genre,
  onProgress?: (progress: number) => void,
): Promise<Image> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('genre', genre);

  const { data } = await axios.post<Image>(
    `${API_BASE_URL}${UPLOAD_ENDPOINT}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      },
    },
  );

  return data;
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

**Goal:** Implement React Query hooks using openapi-fetch client for type-safe API calls with caching and optimistic updates.

#### `frontend/src/hooks/useImages.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client, throwApiError, getImageUrl, getLqipUrl } from '@/api/client';
import { uploadImage } from '@/api/images.api';
import type { ImageFilterDto, Image } from '@/api/types';

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
 * Uses openapi-fetch client for type-safe API calls.
 */
export function useImages(filters: ImageFilterDto = {}) {
  return useQuery({
    queryKey: queryKeys.images(filters),
    queryFn: async () => {
      const { data, error } = await client.GET('/api/images', {
        params: { query: filters },
      });
      if (error) throwApiError(error);
      return data;
    },
  });
}

/**
 * Hook for fetching single image metadata.
 */
export function useImageMetadata(id: string) {
  return useQuery({
    queryKey: queryKeys.imageMetadata(id),
    queryFn: async () => {
      const { data, error } = await client.GET('/api/images/{id}/metadata', {
        params: { path: { id } },
      });
      if (error) throwApiError(error);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for updating image rating with optimistic updates.
 * Uses openapi-fetch client for type-safe PATCH request.
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { data, error } = await client.PATCH('/api/images/{id}/rating', {
        params: { path: { id } },
        body: { rating },
      });
      if (error) throwApiError(error);
      return data;
    },

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
 * Hook for uploading images with progress tracking.
 * Uses custom uploadImage function with axios-based progress.
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
      genre: Parameters<typeof uploadImage>[1];
      onProgress?: (progress: number) => void;
    }) => uploadImage(file, genre, onProgress),

    onSuccess: () => {
      // Invalidate images list to show new upload
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
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
| `frontend/src/api/client.ts` | Create | openapi-fetch client + helpers |
| `frontend/src/api/images.api.ts` | Create | Only uploadImage (custom with progress) |
| `frontend/src/api/index.ts` | Create | API barrel export |
| `frontend/src/hooks/useImages.ts` | Create | TanStack Query hooks using openapi-fetch |
| `frontend/src/hooks/index.ts` | Create | Hooks barrel export |
| `frontend/src/App.tsx` | Modify | Add React Router |
| `frontend/src/main.tsx` | Modify | Add QueryClient provider |
| `frontend/package.json` | Modify | Add dependencies and scripts |

---

## 6. Dependencies to Install

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools react-router-dom openapi-fetch axios
npm install -D openapi-typescript
```

---

## 7. NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "gen": "openapi-typescript http://localhost:3000/api/docs-json -o ./src/api/schema.gen.ts"
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

- [ ] `npm run gen` runs successfully
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
| openapi-fetch version incompatibility | Low | Medium | Pin versions in package.json; test after updates |

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
- [ ] Types can be generated from OpenAPI spec with `npm run gen`
- [ ] Generated types are properly typed and importable
- [ ] API client successfully connects to backend
- [ ] TanStack Query hooks return typed data
- [ ] Router navigates between `/` and `/upload`
- [ ] Environment configuration allows easy API URL changes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] React Query DevTools available in development mode
- [ ] `schema.gen.ts` is committed to git
