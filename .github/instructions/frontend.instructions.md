---
applyTo: "web/*"
---

# Frontend Coding Instructions

## General Rules
- Use TypeScript for all components and hooks.
- Follow Next.js App Router conventions.
- Implement responsive design with Tailwind CSS.
- Use Shadcn/ui components for consistent UI.
- Optimize for performance and accessibility.

## State Management
- Use Zustand for global state management.
- Implement proper loading and error states.
- Handle authentication state with Firebase Auth.
- Persist necessary data in local storage if needed.

## Authentication
- Integrate Firebase Authentication for login/signup.
- Protect routes that require authentication.
- Handle token refresh automatically.
- Display appropriate error messages for auth failures.

## API Integration
- Use the API client in `lib/apiClient.ts` for all backend calls.
- Include Firebase ID tokens in API requests.
- Handle API errors gracefully with user-friendly messages.
- Implement retry logic for failed requests.

## Component Design
- Create reusable components in `components/` directory.
- Use custom hooks for logic separation.
- Implement proper prop types and default values.
- Follow component naming conventions.

## Chat Functionality
- Implement real-time message updates.
- Handle message sending and receiving efficiently.
- Display loading states during AI responses.
- Support message history and session management.

## Testing
- Write unit tests for components and hooks.
- Use React Testing Library for component testing.
- Follow test patterns in `docs/design/test-design.md`.
- Test user interactions and edge cases.

## Code Structure
- Organize code in `app/`, `components/`, `hooks/`, `lib/`, and `store/` directories.
- Use meaningful file and component names.
- Keep components small and focused.
- Document complex
