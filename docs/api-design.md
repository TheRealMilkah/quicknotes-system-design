
# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking application that allows users to create, view, update, and delete notes. The API follows REST principles and uses HTTP methods to represent operations on resources.

The API examples in this document describe a proposed production API. The current frontend uses JSONPlaceholder as a demonstration service, so not every endpoint described here is implemented or connected to a persistent database.

### Base URL

```text
https://api.quicknotes.example/v1
```

### General conventions

- Format: JSON
- Authentication: Bearer token for protected endpoints
- Identifiers: Integer IDs in the examples
- Dates: ISO 8601 timestamps in UTC
- Pagination: `page` and `limit` query parameters where applicable

## 2. API Endpoints

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | 201 Created |
| POST | `/auth/login` | Authenticate a user | 200 OK |
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{noteId}` | Retrieve one note | 200 OK |
| POST | `/notes` | Create a note | 201 Created |
| PUT | `/notes/{noteId}` | Replace an existing note | 200 OK |
| DELETE | `/notes/{noteId}` | Delete a note | 204 No Content |

## 3. Endpoint Specifications

### 3.1 Register a user

**Request**

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "Amina Hassan",
  "email": "amina@example.com",
  "password": "example-password"
}
```

**Successful response — 201 Created**

```json
{
  "id": 12,
  "name": "Amina Hassan",
  "email": "amina@example.com",
  "createdAt": "2026-10-18T10:00:00Z"
}
```

Passwords must never be returned in API responses or stored as plain text.

### 3.2 Log in

**Request**

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "amina@example.com",
  "password": "example-password"
}
```

**Successful response — 200 OK**

```json
{
  "accessToken": "example-access-token",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

The example token is illustrative. A production implementation must issue and validate secure tokens.

### 3.3 List notes

**Request**

```http
GET /notes?page=1&limit=10
Authorization: Bearer example-access-token
```

**Successful response — 200 OK**

```json
{
  "data": [
    {
      "id": 101,
      "title": "Project planning",
      "body": "Prepare the project schedule.",
      "createdAt": "2026-10-18T09:00:00Z",
      "updatedAt": "2026-10-18T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

The API returns only notes belonging to the authenticated user.

### 3.4 Retrieve a single note

**Request**

```http
GET /notes/101
Authorization: Bearer example-access-token
```

**Successful response — 200 OK**

```json
{
  "id": 101,
  "title": "Project planning",
  "body": "Prepare the project schedule.",
  "createdAt": "2026-10-18T09:00:00Z",
  "updatedAt": "2026-10-18T09:00:00Z"
}
```

If the note does not exist or is not accessible to the user, the API returns an appropriate not-found response.

### 3.5 Create a note

**Request**

```http
POST /notes
Authorization: Bearer example-access-token
Content-Type: application/json
```

```json
{
  "title": "Meeting notes",
  "body": "Review the project milestones."
}
```

**Successful response — 201 Created**

```json
{
  "id": 102,
  "title": "Meeting notes",
  "body": "Review the project milestones.",
  "createdAt": "2026-10-18T10:30:00Z",
  "updatedAt": "2026-10-18T10:30:00Z"
}
```

The server generates the note ID and timestamps. The client must not choose another user's identity or assign ownership directly.

### 3.6 Update a note

**Request**

```http
PUT /notes/102
Authorization: Bearer example-access-token
Content-Type: application/json
```

```json
{
  "title": "Updated meeting notes",
  "body": "Review the milestones and assign tasks."
}
```

**Successful response — 200 OK**

```json
{
  "id": 102,
  "title": "Updated meeting notes",
  "body": "Review the milestones and assign tasks.",
  "createdAt": "2026-10-18T10:30:00Z",
  "updatedAt": "2026-10-18T11:00:00Z"
}
```

PUT replaces the editable contents of an existing note. The server checks that the authenticated user owns the note before updating it.

### 3.7 Delete a note

**Request**

```http
DELETE /notes/102
Authorization: Bearer example-access-token
```

**Successful response — 204 No Content**

The server deletes the note and returns an empty response body.

## 4. Error Handling

Errors use a consistent JSON structure.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required."
  }
}
```

| HTTP status | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid request data | Missing note title |
| 401 Unauthorized | Authentication is missing or invalid | Expired access token |
| 403 Forbidden | The user lacks permission | Attempt to access a restricted operation |
| 404 Not Found | The requested resource is unavailable | Note does not exist |
| 500 Internal Server Error | Unexpected server failure | Unhandled database error |

### Error response examples

**400 Bad Request**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note title is required."
  }
}
```

**401 Unauthorized**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

**403 Forbidden**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

**404 Not Found**

```json
{
  "error": {
    "code": "NOTE_NOT_FOUND",
    "message": "The requested note could not be found."
  }
}
```

**500 Internal Server Error**

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

The API must avoid exposing passwords, access tokens, database credentials, or internal stack traces in error responses.

## 5. Validation and Security

- Require a non-empty title of no more than 100 characters.
- Validate request bodies on the server, even when the frontend already performs validation.
- Authenticate protected requests using a valid access token.
- Verify resource ownership before reading, changing, or deleting a note.
- Use HTTPS for all production requests.
- Apply rate limits to authentication and other sensitive endpoints.
- Use parameterized SQL queries to reduce SQL injection risks.
- Return only the data the requesting user is authorized to access.

## 6. Implementation Status

The frontend currently uses JSONPlaceholder to demonstrate HTTP requests. The documented QuickNotes API is a proposed design; registration, authentication, note updates, persistent storage, and the remaining production endpoints would require a backend implementation.
