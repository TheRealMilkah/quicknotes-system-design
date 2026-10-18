
# QuickNotes System Design

QuickNotes is a note-taking application and system design project demonstrating a simple web client, REST API integration, relational database design, and scalable system architecture.

The project explores how a basic note-taking application could evolve to support one million registered users while maintaining performance, security, reliability, and data integrity.

## Project Objectives

- Build a simple browser-based interface for viewing, creating, and deleting notes.
- Demonstrate HTTP GET, POST, and DELETE requests using JavaScript Fetch API.
- Document a REST API with endpoint definitions, request examples, and error responses.
- Design a relational database for users, notes, tags, and their relationships.
- Propose an architecture that can scale as the number of users and requests grows.

## Repository Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Technologies Used

- **HTML5:** Defines the application's structure.
- **CSS3:** Provides layout, styling, and responsive behavior.
- **JavaScript:** Handles user interactions and API requests.
- **Fetch API:** Sends HTTP requests to the demonstration API.
- **REST:** Guides the proposed API resource and endpoint design.
- **PostgreSQL:** Serves as the proposed relational database.
- **Git and GitHub:** Track changes and host the project.

## How to Run the Application

### Option 1: Open the HTML file

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.
4. Select **Load Notes** to retrieve example notes.
5. Use the form to create a note.
6. Select **Delete** to remove a note from the current view.

An internet connection is required because the JavaScript client uses JSONPlaceholder.

### Option 2: Use Visual Studio Code

1. Clone the repository:

   ```bash
   git clone https://github.com/TheRealMilkah/quicknotes-system-design.git
   ```

2. Open the project folder in Visual Studio Code.
3. Open `index.html` in your browser, or use a local development server such as the Live Server extension.
4. Test the note-loading, creation, and deletion workflows.

No build step or package installation is required for the current frontend.

## Demonstration API

The frontend uses JSONPlaceholder:

```text
https://jsonplaceholder.typicode.com/posts
```

It demonstrates:

- `GET /posts?_limit=10` — retrieve example posts.
- `POST /posts` — simulate creating a post.
- `DELETE /posts/{id}` — simulate deleting a post.

**Important limitation:** JSONPlaceholder is a testing service. POST and DELETE requests simulate successful operations but do not permanently change the remote dataset. Newly created notes and deletions in this project are reflected in the current browser session only.

The production API described in the documentation is a proposed design. A backend and database would be needed to provide real authentication and persistent note storage.

## Technical Documentation

Read the design documents for the full technical details:

- [API Design](docs/api-design.md) — REST endpoints, HTTP methods, request and response examples, validation, and error handling.
- [Data Model](docs/data-model.md) — database entities, columns, relationships, SQL definitions, queries, indexes, and the SQL versus NoSQL decision.
- [System Architecture](docs/architecture.md) — requirements, architecture diagram, request flows, capacity estimates for one million users, scaling strategies, trade-offs, and reliability.

## Security Considerations

- Validate user input in the browser and on the server.
- Use secure authentication and authorization in a production implementation.
- Verify note ownership before allowing access or changes.
- Store passwords using a secure password-hashing algorithm.
- Use HTTPS and protect sensitive information.
- Use parameterized database queries.
- Avoid exposing internal errors or credentials in API responses.

The current frontend is an educational demonstration and does not implement production authentication or a persistent backend.

## What I Learned

1. **REST API integration:** I learned how JavaScript Fetch API requests use HTTP methods, handle responses, and report errors.
2. **Database design:** I learned how primary keys, foreign keys, and junction tables establish relationships and maintain data integrity.
3. **System architecture:** I learned how load balancers, caching, application servers, read replicas, and message queues support scalability.
4. **Capacity planning:** I learned how to estimate request rates and storage growth using explicit assumptions.
5. **Reliability and trade-offs:** I learned why caching, replication, redundancy, and background processing involve trade-offs between performance, consistency, cost, and complexity.

## Future Improvements

- Implement a backend API using a framework such as FastAPI or Express.
- Connect the backend to PostgreSQL for persistent storage.
- Add registration, login, and secure authentication.
- Implement note updates and tag management.
- Add automated tests and API integration tests.
- Configure deployment, monitoring, backups, and recovery procedures.

## Author

Milkah

## License

This project was created for educational and system design practice.
