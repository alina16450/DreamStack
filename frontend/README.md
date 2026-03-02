# New Project

A small React frontend for managing a bucket-list of places. The app uses a simple API client (`src/api.js`) and React Context providers for authentication and bucket data.

## Features
- List, add, edit, mark visited, and delete bucket items
- Uses `BucketContext` to call the backend API
- Tests for Services and components included under `src/Tests`

## Repo structure

- public/ — static assets
- src/ — React source code
  - Repository/ — `AuthContext.js`, `BucketContext.js` (API adapters)
  - Service/ — page and hook implementations used by UI
  - Tests/ — Jest + React Testing Library tests

## Prerequisites
- Node.js 18+ and npm

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Docker (optional)

Build and run with Docker (if Dockerfile present):

## Features
- List, add, edit, mark visited, and delete bucket items
- Uses `BucketContext` to call the backend API
- Tests for Services and components included under `src/Tests`

## Repo structure

- public/ — static assets
- src/ — React source code
  - Repository/ — `AuthContext.js`, `BucketContext.js` (API adapters)
  - Service/ — page and hook implementations used by UI
  - Tests/ — Jest + React Testing Library tests

## What this project implements

- Routing with three main pages: `/` (home), `/add`, `/edit` and a 404 page.
- Home page shows a table of bucket items with filter/sort controls, visit toggles, and summary statistics (total, visited, top category).
- Add page includes form validation (required fields, basic input validation) and prevents submit when invalid.
- Edit page allows updating or deleting an item.

## Implementation & Skills

This project is implemented as a small, component-driven React application with clear separation between UI, service logic, and API-adapter layers. It demonstrates skills and patterns useful for employer review:

- **Frontend stack:** React (functional components + Hooks), CSS for styling, typical single-page app structure.
- **State & data flow:** Context API (`BucketContext`, `AuthContext`) used as a lightweight repository/adapter layer to encapsulate API calls and provide app-wide access to data and auth state.
- **API integration:** `src/api.js` centralizes HTTP calls. The UI calls `BucketContext` which performs `GET/POST/PUT/DELETE` against the backend.
- **Separation of concerns:** `Service/` contains page components and reusable hooks (filters, form handling). The app favors testing units and hooks over implementation details.
- **Testing:** Jest + React Testing Library for component and hook tests; example tests are under `src/Tests`. The test suite demonstrates mocking strategies for repositories and API behavior.
- **Design & refactoring:** The project shows pragmatic refactoring (removing an unused in-memory domain and replacing tests with mocks) and the ability to swap local vs API-backed data sources.
- **DevOps basics:** `Dockerfile` included for container builds and standard npm scripts for dev/build/test.

## Demonstrated skills

- Building user-facing React applications with state management and routing
- Designing testable code: hooks, contexts, and small pure functions
- Writing unit and integration tests with Jest and React Testing Library
- RESTful API integration and error handling patterns
- Simple containerization using Docker
- Code organization, clear separation of concerns, and incremental refactoring
