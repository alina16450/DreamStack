# DreamStack — Fullstack Bucket List Application
DreamStack is a fullstack bucket list management application designed to demonstrate modern web development practices, clean architecture, and secure authentication workflows.

### Concept and Purpose:
This project was designed with a need I encountered in my life, where I would come across an interesting location that I would love to visit in a country and add it to a notepad file on my phone.
That way, next time I find myself in that country, I have an easy list of interesting activities/locations. This list quickly turned into unwieldy chaos, in desperate need of an update.
DreamStack is designed to solve this problem for myself and any other user that may find themselves with a similar problem. 


## Tech Stack
- **Frontend:** React (SPA)
- **Backend:** FastAPI (Python)
- **Database:** SQLite (SQLModel ORM)
- **Authentication:** OAuth2 + token-based authentication
- **Deployment:** Docker + Docker Compose

---

##  Architecture Overview
React SPA (Frontend)
│
│ REST API (HTTP)
▼
FastAPI Backend
│
▼
SQLite Database

The frontend and backend are fully decoupled and communicate via RESTful API endpoints.

---

## Features

### Authentication
- User registration with validation
- Secure login with token generation
- OAuth2 third-party authentication
- Protected routes and token-based authorization

### Bucket List Management
- Create, edit, delete bucket items
- Mark items as visited
- Filter and sort by multiple attributes
- Summary statistics (total items, visited count, top category)

### Testing
- Frontend: Jest + React Testing Library
```bash
cd frontend
npm test
```
- Backend: Pytest (unit + integration tests)
```bash
cd backend
pytest
```
---

## Repository Structure
- backend/ # FastAPI application
- frontend/ # React application
- docker-compose.yml
- README.md

## Running the Full Application (Recommended)
```bash
docker-compose up --build
```
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
Frontend: http://localhost:3000

Option 2: Manual Development Mode
#Backend
See: backend/READNE.md
#Frontend
See: frontend/README.md

## What This Project Demonstrates
- Fullstack system design
- RESTful API architecture
- OAuth authentication flows
- React state management using Context API
- SQL relational modeling
- Test-driven development
- Containerized deployment
