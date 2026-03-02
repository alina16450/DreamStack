# FRONTEND README (`/frontend/README.md`)

```markdown
# DreamStack Frontend
```
React application for interacting with the DreamStack backend.

---

## Tech Stack

- React (Hooks)
- Context API
- REST API integration
- Jest
- React Testing Library

---

## Architecture Overview

- public/ — static assets
- src/ — React source code
  - Repository/ — `AuthContext.js`, `BucketContext.js` (API adapters)
  - Service/ — page and hook implementations used by UI
  - Tests/ — Jest + React Testing Library tests
- `api.js` centralizes HTTP requests
- 
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
```bash
docker build -t dreamstack-frontend .
```

