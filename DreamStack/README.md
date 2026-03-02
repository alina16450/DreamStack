# DreamStack: Bucket List Management System

DreamStack is a feature-rich and secure backend project designed to handle the logic of the DreamStack project in an intuitive and easy manner. It leverages modern Python frameworks and tools to provide authentication, efficient relationship modeling, customizable filtering and sorting solutions.

Built with **FastAPI** and **SQLModel**, DreamStack exemplifies clean architecture, scalability, and professional-grade implementation practices, showcasing full-stack backend development skills.

---

### Concept and Purpose:
This project was designed with a need I encountered in my life, where I would come across an interesting location that I would love to visit in a country and add it to a notepad file on my phone.
That way, next time I find myself in that country, I have an easy list of interesting activities/locations. This list quickly turned into unwieldy chaos, in desperate need of an update.
DreamStack is designed to solve this problem for myself and any other user that may find themselves with a similar problem. 

**Architecture Overview**:
- **Frontend**: Implemented using React.
- **Backend**: Built with Python and FastAPI, exposing clean, secure, and extensible RESTful API endpoints.
- **Database**: Relational design (SQLite for now) with efficient data modeling to handle relationships between users and their bucket lists.
- **Scalability**: Dockerized for seamless deployment in production environments.

### Key Features:
- **OAuth Authentication**:
  - Secure login via third-party providers supported by OAuth2.
  - Token management ensures sessions remain secure and valid across client apps.
- **CRUD Operations**:
  - Create, retrieve, update, and delete (CRUD) functionality for bucket list items is fully supported.
- **Data Filtering**:
  - Custom filters let users narrow down their list by location, category, or status (visited/unvisited).
- **Sorting Capabilities**:
  - Items can be sorted dynamically by attributes like country, city, or category.
- **Robust Validation**:
  - Enforces strong password policies and rejects weak or insecure inputs.
- **Error Handling**:
  - Graceful responses and meaningful error codes for seamless API usage.
- **User Roles**:
  - Role-based access control (future development to separate admin and general user functionality).

---

##  Technologies Used
- **FastAPI**: High-performance backend framework for building APIs.
- **SQLModel**: ORM for relational database management.
- **Pydantic**: Data validation and settings management made simple.
- **OAuth2**: Third-party authentication support.
- **SQLite**: Lightweight relational database for development.
- **Docker**: Containerized deployment for portability.
- **Pytest**: Unit testing for robust code quality.

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

## Setup Instructions

### Local Development
1. **Clone the Repository**:
    ```bash
    git clone https://github.com/<your-username>/DreamStack.git
    cd DreamStack
    ```

2. **Setup a Virtual Environment**:
    ```bash
    virtualenv .venv
    source .venv/bin/activate   # For Windows: .venv\Scripts\activate
    ```

3. **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Initialize the Database**:
    ```python
    from app.Service.database import init_db
    init_db()
    ```

5. **Run the Development Server**:
    ```bash
    uvicorn Backend.app.main:app --reload
    ```

6. **Access the API**:
    - Navigate to `http://127.0.0.1:8000/docs` for the interactive OpenAPI documentation.

---

### Docker Deployment
1. **Build the Docker Image**:
    ```bash
    docker build -t dreamstack:latest .
    ```

2. **Run a Container**:
    ```bash
    docker run -dp 8000:8000 dreamstack:latest
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

2. **Test Highlights**:
    - Unit tests for every manager (`BucketListManager`, `UserManager`).
    - Integration tests for API endpoints.
    - Edge case tests for database-level functionality.

---

##  Future Enhancements
- **Advanced Authentication**: Add MFA (Multi-Factor Authentication) for strengthened security.
- **Pagination**: Implement pagination in the bucket list for large datasets.
- **CI/CD Integration**: Add GitHub Actions for automated testing, building, and deployment.

---

## About the Developer
Crafted by a passionate backend developer, DreamStack serves as a testament to my ability to create production-grade software systems. With clean architecture, secure practices, and advanced functionality, this project is ready to take on real-world challenges.

Want to connect? Feel free to reach out or check out my other repositories!