const API_URL = "http://127.0.0.1:8000/books"; // TEMP: Replace with Render URL later

async function fetchBooks() {
  const res = await fetch(API_URL);
  const books = await res.json();

  const list = document.getElementById("book-list");
  list.innerHTML = "";
  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = `${book.title} by ${book.author} (${book.genre})`;
    list.appendChild(li);
  });
}

document.getElementById("book-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const genre = document.getElementById("genre").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, genre })
  });

  e.target.reset();
  fetchBooks();
});

fetchBooks();
