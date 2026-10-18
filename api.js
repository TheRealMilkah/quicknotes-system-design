
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");
const statusMessage = document.getElementById("status");

let notes = [];
let nextLocalId = -1;

// Display loading, success, or error feedback to the user.
function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status";

  if (type) {
    statusMessage.classList.add(type);
  }
}

// Make API requests and handle HTTP and network errors consistently.
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}. Please try again.`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Create HTML elements safely without inserting user input as HTML.
function createNoteElement(note) {
  const listItem = document.createElement("li");
  listItem.className = "note-card";
  listItem.dataset.noteId = String(note.id);

  const title = document.createElement("h4");
  title.textContent = note.title;

  const body = document.createElement("p");
  body.textContent = note.body || "No content provided.";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete note: ${note.title}`);

  deleteButton.addEventListener("click", () => {
    deleteNote(note.id, deleteButton);
  });

  listItem.append(title, body, deleteButton);

  return listItem;
}

// Render the current notes list.
function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent =
      "No notes to display. Create a note to get started.";
    notesList.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  notes.forEach((note) => {
    fragment.appendChild(createNoteElement(note));
  });

  notesList.appendChild(fragment);
}

// Load notes from the API.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");

  try {
    const data = await request(`${API_URL}?_limit=10`);

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    notes = data.map((item) => ({
      id: item.id,
      title: item.title || "Untitled note",
      body: item.body || "",
    }));

    renderNotes();
    showStatus(`Successfully loaded ${notes.length} notes.`, "success");
  } catch (error) {
    showStatus(
      `Unable to load notes: ${error.message}`,
      "error"
    );
  } finally {
    loadButton.disabled = false;
  }
}

// Create a note using an HTTP POST request.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a note title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title cannot exceed 100 characters.", "error");
    titleInput.focus();
    return;
  }

  if (!body) {
    showStatus("Please enter some note content.", "error");
    bodyInput.focus();
    return;
  }

  submitButton.disabled = true;
  loadButton.disabled = true;
  showStatus("Creating your note...");

  try {
    const createdNote = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({
        title,
        body,
        userId: 1,
      }),
    });

    // JSONPlaceholder simulates creation rather than permanently saving data.
    // Use a local ID so newly created notes can be managed in this session.
    const localNote = {
      id: nextLocalId--,
      title: createdNote.title || title,
      body: createdNote.body || body,
    };

    notes.unshift(localNote);
    renderNotes();
    noteForm.reset();

    showStatus(
      "Note created successfully for this session.",
      "success"
    );
  } catch (error) {
    showStatus(
      `Unable to create note: ${error.message}`,
      "error"
    );
  } finally {
    submitButton.disabled = false;
    loadButton.disabled = false;
  }
}

// Delete a note using an HTTP DELETE request.
async function deleteNote(noteId, deleteButton) {
  const originalText = deleteButton.textContent;

  deleteButton.disabled = true;
  deleteButton.textContent = "Deleting...";
  showStatus("Deleting note...");

  try {
    // JSONPlaceholder accepts DELETE requests but does not persist changes.
    await request(`${API_URL}/${noteId}`, {
      method: "DELETE",
    });

    notes = notes.filter((note) => note.id !== noteId);
    renderNotes();

    showStatus(
      "Note deleted from the current view.",
      "success"
    );
  } catch (error) {
    deleteButton.disabled = false;
    deleteButton.textContent = originalText;

    showStatus(
      `Unable to delete note: ${error.message}`,
      "error"
    );
  }
}

// Connect the interface to its event handlers.
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Show the initial empty state.
renderNotes();
