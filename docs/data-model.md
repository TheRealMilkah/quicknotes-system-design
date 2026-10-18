
# QuickNotes Data Model

## 1. Overview

QuickNotes is a note-taking application where users can create, organize, update, and delete notes. The database must store user accounts, notes, tags, and the relationships between notes and tags.

For this design, PostgreSQL is the primary relational database because QuickNotes needs structured records, reliable relationships, transactions, and data integrity.

## 2. Database Entities

The database contains four main entities:

1. **Users:** Stores account information for each registered user.
2. **Notes:** Stores the title and content of each note and identifies its owner.
3. **Tags:** Stores labels that users can apply to notes.
4. **Note_Tags:** Connects notes to tags through a many-to-many relationship.

## 3. Tables and Columns

### 3.1 Users table

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | TIMESTAMPTZ | NOT NULL | Account creation time |

Passwords must be stored as secure password hashes, never as plain text.

### 3.2 Notes table

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique note identifier |
| user_id | BIGINT | Foreign key, NOT NULL | Owner of the note |
| title | VARCHAR(100) | NOT NULL | Note title |
| body | TEXT | NOT NULL | Note content |
| created_at | TIMESTAMPTZ | NOT NULL | Note creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

Each note belongs to one user. A user can own many notes.

### 3.3 Tags table

| Column | Data type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | Primary key | Unique tag identifier |
| user_id | BIGINT | Foreign key, NOT NULL | User who owns the tag |
| name | VARCHAR(50) | NOT NULL | Tag name |
| created_at | TIMESTAMPTZ | NOT NULL | Tag creation time |

A tag belongs to a user. The same user should not have duplicate tag names.

### 3.4 Note_Tags table

| Column | Data type | Constraints | Description |
|---|---|---|---|
| note_id | BIGINT | Foreign key, primary key | Linked note |
| tag_id | BIGINT | Foreign key, primary key | Linked tag |

The combination of `note_id` and `tag_id` forms a composite primary key. This prevents the same tag from being linked to the same note more than once.

## 4. Entity Relationships

### One-to-many relationship: Users and Notes

One user can create many notes, while each note belongs to one user. The `user_id` foreign key in the Notes table establishes this relationship.

### One-to-many relationship: Users and Tags

One user can create many tags, while each tag belongs to one user. The `user_id` foreign key in the Tags table establishes this relationship.

### Many-to-many relationship: Notes and Tags

A note can have multiple tags, and a tag can be applied to multiple notes. The Note_Tags junction table connects the two entities.

## 5. SQL Table Definitions

The following PostgreSQL statements define the four tables and their relationships.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name),
    UNIQUE (id, user_id)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (tag_id, user_id)
        REFERENCES tags(id, user_id) ON DELETE CASCADE,
    FOREIGN KEY (note_id, user_id)
        REFERENCES notes(id, user_id) ON DELETE CASCADE
);
```

To support the final ownership constraint, the Notes table also needs a composite uniqueness constraint on `(id, user_id)`. Add it to the Notes table definition above, immediately before the closing parenthesis:

```sql
UNIQUE (id, user_id)
```

This ensures that a note-tag relationship cannot associate a user's note with another user's tag.

## 6. Example SQL Queries

### Query 1: Retrieve all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This query retrieves the notes owned by user 1, showing the most recently updated notes first.

### Query 2: Retrieve a note and its owner

```sql
SELECT
    notes.id,
    notes.title,
    notes.body,
    users.name AS owner_name,
    users.email AS owner_email
FROM notes
JOIN users ON notes.user_id = users.id
WHERE notes.id = 101;
```

This query joins the Notes and Users tables to return a note together with its owner's information.

### Query 3: Retrieve notes and their tags

```sql
SELECT
    notes.id,
    notes.title,
    tags.name AS tag_name
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1
ORDER BY notes.id, tags.name;
```

This query joins three tables to show the tags associated with a user's notes.

### Query 4: Create a new note

```sql
INSERT INTO notes (user_id, title, body)
VALUES (1, 'Project planning', 'Prepare the project schedule.')
RETURNING id, title, body, created_at;
```

The database generates the note ID and creation timestamp.

## 7. Indexing Strategy

Indexes help the database find records without scanning every row.

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

This index supports the common operation of listing a user's notes in order of recent updates.

The unique constraint on the Users table's email column automatically creates a unique index in PostgreSQL. The composite primary key on Note_Tags also creates an index that supports lookups beginning with `note_id`.

Indexes require additional storage and make writes slightly more expensive, so they should be added based on actual query patterns.

## 8. SQL vs NoSQL

### Why PostgreSQL is suitable

PostgreSQL is a relational database that provides:

- **Relationships:** Foreign keys connect users, notes, and tags.
- **Data integrity:** Constraints prevent invalid or inconsistent records.
- **Transactions:** Related operations can succeed or fail together.
- **Structured queries:** SQL supports filtering, sorting, joins, and reporting.
- **Mature tooling:** Backups, monitoring, access controls, and replication are well established.

### When NoSQL might be appropriate

A document database could be useful if note structures vary significantly or the application requires a flexible document format. It may also suit workloads where access patterns are simple and horizontal scaling is a priority.

However, embedding tags and other related data inside documents can create duplication and make consistency harder to maintain.

### Final decision

PostgreSQL is the preferred starting point for QuickNotes because its relational model fits the relationships between users, notes, and tags. The system can add caching, read replicas, or other scaling techniques as usage increases, without abandoning relational data integrity.
