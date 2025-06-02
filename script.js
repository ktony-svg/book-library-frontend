// script.js

// API URL for your local backend
const API_BASE_URL = "http://127.0.0.1:8000/books";

// --- DOM Elements ---
const bookList = document.getElementById("book-list");
const bookForm = document.getElementById("book-form");
const messageBox = document.getElementById("message-box");
const loadingMessage = document.getElementById("loading-message");
const spinner = document.getElementById('loading-spinner'); // Get the spinner element directly

const searchForm = document.getElementById("search-form");
const searchTitle = document.getElementById("search-title");
const searchAuthor = document.getElementById("search-author");
const searchGenre = document.getElementById("search-genre");
const clearSearchButton = document.getElementById("clear-search");

const clock = document.getElementById("clock");
const scrollToFormBtn = document.getElementById("scrollToForm");
const scrollToTopBtn = document.getElementById("scrollToTop");


// --- Helper Functions ---

// Displays temporary messages (success or error) to the user
function showMessage(msg, success) {
    messageBox.textContent = msg;
    messageBox.className = `block p-3 mt-2 rounded-lg text-sm text-center ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`;
    messageBox.classList.remove("hidden"); // Ensure it's visible
    setTimeout(() => messageBox.classList.add("hidden"), 3000); // Hide after 3 seconds
}

// Applies a subtle scale animation to a button on click
function animateButton(button) {
    button.classList.add('scale-95', 'transition', 'duration-100', 'ease-in-out');
    setTimeout(() => {
        button.classList.remove('scale-95');
    }, 100);
}


// --- Core Functionality ---

// Updates the clock display every second
function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
}

// Fetches and displays books, with optional search parameters
async function fetchBooks(searchParams = {}) {
    // Show spinner and hide loading message
    loadingMessage.classList.add('hidden');
    spinner.classList.remove('hidden');
    bookList.innerHTML = ''; // Clear existing list items

    let url = API_BASE_URL;
    const params = new URLSearchParams();

    // Add search parameters if they exist and are not empty
    if (searchParams.title) params.append('title', searchParams.title);
    if (searchParams.author) params.append('author', searchParams.author);
    if (searchParams.genre) params.append('genre', searchParams.genre);

    // Append parameters to the URL if any
    if (params.toString()) {
        url = `${API_BASE_URL}?${params.toString()}`;
    }

    try {
        const response = await fetch(url);
        
        // Handle HTTP errors (e.g., 404 from backend if no search results match)
        if (!response.ok) {
            // Specific handling for 404 on search queries
            if (response.status === 404 && (searchParams.title || searchParams.author || searchParams.genre)) {
                bookList.innerHTML = '<p class="text-center text-gray-500">No books found matching your search criteria.</p>';
                return; // Exit function
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        const books = await response.json();

        if (books.length === 0) {
            bookList.innerHTML = '<p class="text-center text-gray-400">No books found. Add one above!</p>';
        } else {
            bookList.innerHTML = ""; // Clear existing placeholder/spinner
            books.forEach(book => {
                const li = document.createElement("li");
                // Apply different background for search results for visual distinction
                li.className = `p-4 rounded-lg shadow border border-gray-200 text-gray-800 ${
                    searchParams.title || searchParams.author || searchParams.genre ? 'bg-yellow-50' : 'bg-white'
                }`;
                li.innerHTML = `<strong>${book.title}</strong> by ${book.author} <em>(${book.genre})</em>`;
                bookList.appendChild(li);
            });
        }
    } catch (err) {
        console.error("Error fetching books:", err);
        bookList.innerHTML = `<p class="text-red-500 text-center">Failed to load books. Please ensure your backend is running.</p>`;
        showMessage("Failed to load books or search failed.", false);
    } finally {
        // Always hide spinner after fetch attempt
        spinner.classList.add('hidden');
    }
}


// --- Event Listeners ---

// Add new book form submission
bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    animateButton(e.submitter); // Animate the clicked button

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const genre = document.getElementById("genre").value.trim();

    if (!title || !author || !genre) {
        showMessage("Please fill in all fields.", false);
        return;
    }

    try {
        const res = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, genre }),
        });

        if (res.ok) {
            showMessage("Book added successfully!", true);
            bookForm.reset(); // Clear form
            fetchBooks(); // Refresh list to show new book
        } else {
            const errorData = await res.json();
            showMessage(`Failed to add book: ${errorData.detail || 'Unknown error'}`, false);
        }
    } catch (err) {
        console.error("Error adding book:", err);
        showMessage("Server error. Please ensure your backend is running.", false);
    }
});

// Search form submission
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    animateButton(e.submitter); // Animate the clicked button

    const searchParams = {
        title: searchTitle.value.trim(),
        author: searchAuthor.value.trim(),
        genre: searchGenre.value.trim()
    };
    fetchBooks(searchParams); // Fetch books based on search parameters
});

// Clear search button click
clearSearchButton.addEventListener("click", () => {
    animateButton(clearSearchButton); // Animate button
    searchForm.reset(); // Clear search input fields
    fetchBooks(); // Fetch all books (no search params)
});


// --- Initial Setup ---

// Start the clock
setInterval(updateClock, 1000);
updateClock(); // Display time immediately on load

// Hide scroll to top button initially
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.remove("hidden");
    } else {
        scrollToTopBtn.classList.add("hidden");
    }
});

// Initial fetch of all books when the page loads
fetchBooks();
