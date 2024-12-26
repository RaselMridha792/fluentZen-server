# Assignment 11 Server Side--- FluentZen

This project is the server-side implementation for Assignment 11. It is built using Node.js, Express, and MongoDB. The server handles various API endpoints for managing tutorials, users, and bookings.

## Key Features

1. **JWT Authentication**:
   - Secure authentication using JSON Web Tokens (JWT) to protect API endpoints.

2. **Add Tutorials**:
   - Endpoint to add new tutorials to the database.
   - Protected by JWT authentication.

3. **Save User**:
   - Endpoint to save user information to the database.
   - Open to all users.

4. **Get Users**:
   - Endpoint to retrieve all users from the database.
   - Open to all users.

5. **Get All Tutors**:
   - Endpoint to retrieve all tutors from the database.
   - Open to all users.

6. **Get Booked Tutors**:
   - Endpoint to retrieve booked tutors for a specific user.
   - Protected by JWT authentication and checks user email.

7. **Get User Tutorials**:
   - Endpoint to retrieve tutorials added by a specific user.
   - Protected by JWT authentication and checks user email.

8. **Delete Tutorial**:
   - Endpoint to delete a tutorial by its ID.
   - Protected by JWT authentication.

9. **CORS Configuration**:
   - Configured to handle Cross-Origin Resource Sharing (CORS) for specific client origins.

10. **Environment Variables**:
    - Uses environment variables for sensitive information like database credentials and JWT secret.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/assignment-11-server-side.git