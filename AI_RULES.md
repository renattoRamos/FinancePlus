# AI Development Rules

This document outlines the tech stack and provides clear rules for which libraries to use for specific functionalities. Following these guidelines ensures consistency, maintainability, and leverages the strengths of our chosen tools.

## Tech Stack

The application is built with a modern, type-safe, and efficient stack:

-   **Framework**: React with TypeScript for building a robust and scalable UI.
-   **Build Tool**: Vite for fast development and optimized builds.
-   **Styling**: Tailwind CSS for a utility-first styling approach, following the custom "Claymorphism" theme defined in `src/index.css`.
-   **UI Components**: A combination of custom components and `shadcn/ui` for a consistent and accessible component library.
-   **Routing**: React Router (`react-router-dom`) for client-side navigation.
-   **Data Fetching & Server State**: TanStack Query (`@tanstack/react-query`) for managing asynchronous data, caching, and server state.
-   **Forms**: React Hook Form (`react-hook-form`) for performance-optimized form handling, paired with Zod for schema validation.
-   **Icons**: Lucide React for a comprehensive and lightweight icon set.
-   **Charts**: Recharts for creating data visualizations.

## Library Usage Rules

### 1. UI & Components

-   **Component Library**: Always prioritize using components from `shadcn/ui` (located in `src/components/ui`). These are our base building blocks.
-   **Custom Components**: For any UI element not covered by `shadcn/ui`, create a new, single-purpose component in `src/components/`.
-   **Styling**: Use **Tailwind CSS exclusively** for styling. Do not write separate `.css` files for components. Use the `cn` utility from `src/lib/utils.ts` to conditionally apply classes.

### 2. State Management

-   **Server State**: Use **TanStack Query** for all data fetching, caching, and server state management (e.g., fetching debts).
-   **Client State**: For local component state, use React's built-in hooks (`useState`, `useReducer`). For global state that needs to be shared across components, use `useContext`.

### 3. Forms

-   **Form Logic**: All forms must be built using **React Hook Form**.
-   **Validation**: Use **Zod** to define validation schemas for forms, integrated with React Hook Form via `@hookform/resolvers`.

### 4. Routing & Navigation

-   **Routing**: Use **React Router** for all page navigation.
-   **Route Definitions**: All routes should be defined in `src/App.tsx`.

### 5. Icons

-   **Icons**: Use icons from the **Lucide React** library only. This ensures visual consistency.

### 6. Notifications

-   **Toasts**: Use the custom `useToast` hook (`@/hooks/use-toast.ts`) for showing toast notifications. The `Toaster` is already set up in `App.tsx`.
-   **Sonner**: The `sonner` library is also available for more complex notifications if needed, but prefer the custom `useToast` hook for consistency.

### 7. Charts and Data Visualization

-   **Charts**: When displaying data in charts or graphs, use the **Recharts** library.

### 8. PWA Functionality

-   **PWA Logic**: Use the `usePWA` hook from `src/hooks/usePWA.tsx` to manage PWA installation prompts, service worker interactions, and push notifications.