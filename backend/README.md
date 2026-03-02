```markdown
# DreamStack Backend
```

FastAPI-based REST API powering the DreamStack application.

---

## Tech Stack
- FastAPI
- SQLModel
- SQLite
- Pydantic
- OAuth2
- Pytest

---

## API Overview

### Authentication
- `POST /auth/register`: Register a new user with strong password validation and unique username enforcement.
- `POST /auth/login`: Secure login endpoint with token generation.
- `POST /auth/oauth`: Third-party authentication using OAuth2.

### Bucket List Management
- `POST /bucketlist`: Add a bucket list item with attributes like location, category, and description.
- `GET /bucketlist`: Retrieve all bucket items for the current user, with support for filters and sorting.
- `PUT /bucketlist/{item_id}`: Update an item's name, description, or visited status.
- `DELETE /bucketlist/{item_id}`: Delete a specific bucket list item based on its ID.

### User Management
- `GET /users/{user_id}`: Retrieve user-specific details, including linked bucket list entries.
- `DELETE /users/{user_id}`: Delete a user and associated bucket list items (cascading delete).

---


## Local Development Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

6. **Access the API**:
    - Navigate to `http://127.0.0.1:8000/docs` for the interactive OpenAPI documentation.

---

### Docker Deployment
```bash
docker build -t dreamstack-backend .
docker run -dp 8000:8000 dreamstack-backend
```

3. **Access the API**:
    - Same as above, head over to `http://127.0.0.1:8000/docs`.

---

## Testing

DreamStack prioritizes test-driven development to ensure a reliable and failure-resistant system.

1. **Run All Tests**:
    ```bash
    pytest Tests/
    ```