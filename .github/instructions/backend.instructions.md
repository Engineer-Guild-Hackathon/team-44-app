---
applyTo: "functions/*"
---

# Backend Coding Instructions

## General Rules
- Use TypeScript for all code.
- Follow Firebase Functions best practices.
- Implement proper error handling and logging.
- Use async/await for asynchronous operations.
- Validate all inputs and handle edge cases.

## Authentication & Security
- Always validate Firebase Auth tokens using `validateAuth` function.
- Apply Firestore security rules as defined in `firestore.rules`.
- Never expose sensitive data in responses.
- Use environment variables for API keys and configuration.

## API Design
- Follow RESTful conventions as specified in `docs/design/api-design.md`.
- Return appropriate HTTP status codes and error messages.
- Implement rate limiting as defined in the API design.
- Use Express middleware for CORS and JSON parsing.

## Data Management
- Use Firestore as the primary database.
- Follow the database schema in `docs/design/database-design.md`.
- Implement proper indexing for queries.
- Handle data migration carefully.

## LLM Integration
- Use the abstract LLM provider interface for flexibility.
- Implement system prompts that encourage learning without direct answers.
- Handle LLM API errors gracefully.
- Support both Gemini and OpenAI providers.

## Testing
- Write unit tests for all services and controllers.
- Use Jest and Firebase emulators for testing.
- Follow test patterns in `docs/design/test-design.md`.
- Maintain high test coverage.

## Code Structure
- Organize code in `controllers/`, `services/`, and `models/` directories.
- Use dependency injection for services.
- Keep functions modular and reusable.
- Document complex logic with comments.
