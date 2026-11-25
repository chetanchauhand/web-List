
const API_KEY = "YOUR_TMDB_API_KEY";

const movies = document.getElementById("movies");

async function loadMovies(query = "") {
  try {
    const url = query
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    movies.innerHTML = "";

    data.results.forEach(movie => {
      if (!movie.poster_path) return;

      const card = document.createElement("div");
      card.className = "movie";

      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      img.alt = movie.title;

      const title = document.createElement("h3");
      title.textContent = movie.title;

      const rating = document.createElement("p");
      rating.textContent = "⭐ " + movie.vote_average.toFixed(1);

      card.append(img, title, rating);
      card.onclick = () => showDetails(movie);

      movies.appendChild(card);
    });
  } catch (error) {
    movies.textContent = "Unable to load movies. Check your API key.";
  }
}

function showDetails(movie) {
  alert(
    movie.title + "\n\n" +
    (movie.overview || "No description available") +
    "\n\nRating: " + movie.vote_average
  );
}

document.getElementById("search").addEventListener("input", e => {
  if (e.target.value.trim().length >= 2) {
    loadMovies(e.target.value.trim());
  } else if (!e.target.value.trim()) {
    loadMovies();
  }
});

loadMovies();
