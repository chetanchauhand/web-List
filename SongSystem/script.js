
// ==========================================
// SONORA MUSIC PLAYER
// HTML + CSS + JAVASCRIPT + JAMENDO API
// ==========================================


// 1. API CONFIGURATION

const CLIENT_ID = "709fa152"; // Testing ID
const API_URL = "https://api.jamendo.com/v3.0/tracks/";


// 2. DOM ELEMENTS

const audio = document.getElementById("audioPlayer");

const searchInput = document.getElementById("searchInput");

const featuredGrid = document.getElementById("featuredGrid");

const recommendedGrid = document.getElementById("recommendedGrid");

const searchResults = document.getElementById("searchResults");

const likedResults = document.getElementById("likedResults");

const recentResults = document.getElementById("recentResults");

const playerTitle = document.getElementById("playerTitle");

const playerArtist = document.getElementById("playerArtist");

const playerCover = document.getElementById("playerCover");

const playButton = document.getElementById("playButton");

const seekBar = document.getElementById("seekBar");

const volumeBar = document.getElementById("volumeBar");

const toast = document.getElementById("toast");


// 3. APPLICATION STATE

let songs = [];
let currentSongIndex = -1;

let isPlaying = false;
let isShuffle = false;

let repeatMode = 0;

let likedSongs = JSON.parse(
    localStorage.getItem("sonoraLiked") || "[]"
);

let recentSongs = JSON.parse(
    localStorage.getItem("sonoraRecent") || "[]"
);

let playlists = JSON.parse(
    localStorage.getItem("sonoraPlaylists") || "[]"
);

let activePage = "home";

let searchTimer;


// 4. NOTIFICATION

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}


// 5. TIME FORMAT

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const min = Math.floor(seconds / 60);

    const sec = Math.floor(seconds % 60);

    return `${min}:${String(sec).padStart(2, "0")}`;

}


// 6. API REQUEST

async function fetchMusic(query = "", genre = "") {

    const params = new URLSearchParams({

        client_id: CLIENT_ID,

        format: "json",

        limit: "24",

        audioformat: "mp32",

        imagesize: "300",

        include: "licenses,musicinfo",

        type: "single albumtrack"

    });

    if (query) {
        params.set("namesearch", query);
    }

    if (genre) {
        params.set("fuzzytags", genre);
    }

    const response = await fetch(
        `${API_URL}?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error("Music API request failed");
    }

    const data = await response.json();

    if (data.headers.status !== "success") {
        throw new Error(
            data.headers.error_message || "API error"
        );
    }

    return data.results || [];

}


// 7. HOME PAGE MUSIC

async function loadHomeMusic() {

    featuredGrid.innerHTML = `
        <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Discovering music...
        </div>
    `;

    recommendedGrid.innerHTML = "";

    try {

        const [featured, recommended] = await Promise.all([

            fetchMusic("", "pop"),

            fetchMusic("", "chillout")

        ]);

        renderMusicCards(featured, featuredGrid);

        renderMusicCards(recommended, recommendedGrid);

    } catch (error) {

        console.error(error);

        featuredGrid.innerHTML = `
            <p class="empty-message">
                Unable to load music. Check your internet
                connection and API Client ID.
            </p>
        `;

    }

}


// 8. MUSIC CARD CREATOR

function renderMusicCards(trackList, container) {

    container.innerHTML = "";

    if (!trackList.length) {

        container.innerHTML = `
            <p class="empty-message">No tracks found.</p>
        `;

        return;

    }

    trackList.forEach(track => {

        const card = document.createElement("div");

        card.className = "music-card";

        const image = document.createElement("img");

        image.className = "music-cover";

        image.src = track.image || "";

        image.alt = track.name;

        image.loading = "lazy";

        image.onerror = () => {
            image.src = "https://placehold.co/300x300/222/fff?text=SONORA";
        };

        const title = document.createElement("h3");

        title.textContent = track.name;

        const artist = document.createElement("p");

        artist.textContent = track.artist_name;

        const button = document.createElement("button");

        button.className = "card-play";

        button.innerHTML = '<i class="fa-solid fa-play"></i>';

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            playTrack(track);

        });

        card.append(image, button, title, artist);

        card.addEventListener("click", () => {

            playTrack(track);

        });

        container.appendChild(card);

    });

}


// 9. SEARCH MUSIC

async function searchMusic(query) {

    if (!query.trim()) {

        searchResults.innerHTML = `
            <p class="empty-message">
                Enter a song or artist name.
            </p>
        `;

        return;

    }

    activePage = "search";

    showPage("search");

    document.getElementById("searchHeading").textContent =
        `Results for "${query}"`;

    searchResults.innerHTML = `
        <p class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Searching music...
        </p>
    `;

    try {

        const results = await fetchMusic(query);

        document.getElementById("resultCount").textContent =
            `${results.length} tracks found`;

        renderSongList(results, searchResults);

    } catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <p class="empty-message">
                Search failed. Please try again.
            </p>
        `;

    }

}


// 10. SEARCH INPUT

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimer);

    const query = searchInput.value.trim();

    if (!query) return;

    searchTimer = setTimeout(() => {

        searchMusic(query);

    }, 600);

});


// CLEAR SEARCH

document.getElementById("clearSearch")
.addEventListener("click", () => {

    searchInput.value = "";

    searchInput.focus();

});


// 11. SONG LIST

function renderSongList(trackList, container) {

    container.innerHTML = "";

    if (!trackList.length) {

        container.innerHTML = `
            <p class="empty-message">
                No music found. Try another search.
            </p>
        `;

        return;

    }

    trackList.forEach((track, index) => {

        const row = document.createElement("div");

        row.className = "result-row";

        const image = document.createElement("img");

        image.src = track.image || "";

        image.alt = track.name;

        image.onerror = () => {
            image.src = "https://placehold.co/100x100/222/fff?text=Music";
        };

        const details = document.createElement("div");

        details.className = "result-details";

        const title = document.createElement("h4");

        title.textContent = track.name;

        const artist = document.createElement("p");

        artist.textContent = track.artist_name;

        details.append(title, artist);

        const duration = document.createElement("span");

        duration.textContent = formatTime(
            Number(track.duration)
        );

        duration.style.color = "#9296a5";

        duration.style.fontSize = "11px";

        const like = document.createElement("button");

        like.className = "result-heart";

        like.innerHTML = isLikedTrack(track.id)
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

        like.addEventListener("click", (event) => {

            event.stopPropagation();

            toggleLike(track);

            renderSongList(trackList, container);

        });

        const play = document.createElement("button");

        play.className = "result-play";

        play.innerHTML = '<i class="fa-solid fa-play"></i>';

        play.addEventListener("click", () => {

            playTrack(track);

        });

        row.addEventListener("dblclick", () => {

            playTrack(track);

        });

        row.append(
            image,
            details,
            duration,
            like,
            play
        );

        container.appendChild(row);

    });

}


// 12. PLAY TRACK

function playTrack(track) {

    if (!track || !track.audio) {

        showToast("Audio is not available for this track.");

        return;

    }

    const index = songs.findIndex(
        item => String(item.id) === String(track.id)
    );

    if (index === -1) {

        songs.push(track);

        currentSongIndex = songs.length - 1;

    } else {

        currentSongIndex = index;

    }

    audio.src = track.audio;

    playerTitle.textContent = track.name;

    playerArtist.textContent = track.artist_name;

    playerCover.src = track.image || "";

    updateLikePlayer();

    saveRecent(track);

    audio.play()
        .then(() => {

            isPlaying = true;

            updatePlayButton();

            showToast("Now playing: " + track.name);

        })
        .catch(error => {

            console.error(error);

            isPlaying = false;

            updatePlayButton();

            showToast("Unable to play this track. Try another.");

        });

}


// 13. PLAY / PAUSE

playButton.addEventListener("click", () => {

    if (!audio.src) {

        if (songs.length) {

            playTrack(songs[0]);

        } else {

            showToast("Search and select a song first.");

        }

        return;

    }

    if (audio.paused) {

        audio.play()
            .then(() => {

                isPlaying = true;

                updatePlayButton();

            })
            .catch(() => {

                showToast("Playback could not start.");

            });

    } else {

        audio.pause();

        isPlaying = false;

        updatePlayButton();

    }

});


function updatePlayButton() {

    playButton.innerHTML = isPlaying
        ? '<i class="fa-solid fa-pause"></i>'
        : '<i class="fa-solid fa-play"></i>';

}


// 14. NEXT SONG

function nextTrack() {

    if (songs.length === 0) return;

    let nextIndex;

    if (isShuffle && songs.length > 1) {

        nextIndex = Math.floor(
            Math.random() * songs.length
        );

        while (nextIndex === currentSongIndex) {

            nextIndex = Math.floor(
                Math.random() * songs.length
            );

        }

    } else {

        nextIndex = (currentSongIndex + 1) % songs.length;

    }

    playTrack(songs[nextIndex]);

}


// 15. PREVIOUS SONG

function previousTrack() {

    if (songs.length === 0) return;

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;

    }

    currentSongIndex--;

    if (currentSongIndex < 0) {

        currentSongIndex = songs.length - 1;

    }

    playTrack(songs[currentSongIndex]);

}


document.getElementById("nextButton")
.addEventListener("click", nextTrack);

document.getElementById("previousButton")
.addEventListener("click", previousTrack);


// 16. SHUFFLE

document.getElementById("shuffleButton")
.addEventListener("click", function() {

    isShuffle = !isShuffle;

    this.classList.toggle("active", isShuffle);

    showToast(isShuffle ? "Shuffle enabled" : "Shuffle disabled");

});


// 17. REPEAT

document.getElementById("repeatButton")
.addEventListener("click", function() {

    repeatMode = (repeatMode + 1) % 3;

    audio.loop = repeatMode === 2;

    this.classList.toggle("active", repeatMode !== 0);

    if (repeatMode === 1) {

        showToast("Repeat queue mode");

    } else if (repeatMode === 2) {

        showToast("Repeat current song");

    } else {

        showToast("Repeat disabled");

    }

});


// 18. AUTO NEXT

audio.addEventListener("ended", () => {

    if (repeatMode === 2) return;

    nextTrack();

});


// 19. PROGRESS BAR

audio.addEventListener("timeupdate", () => {

    if (!audio.duration || !Number.isFinite(audio.duration)) {
        return;
    }

    seekBar.value =
        (audio.currentTime / audio.duration) * 100;

    document.getElementById("currentTime").textContent =
        formatTime(audio.currentTime);

    document.getElementById("totalTime").textContent =
        formatTime(audio.duration);

});


seekBar.addEventListener("input", () => {

    if (Number.isFinite(audio.duration)) {

        audio.currentTime =
            (seekBar.value / 100) * audio.duration;

    }

});


// 20. VOLUME

volumeBar.addEventListener("input", () => {

    audio.volume = Number(volumeBar.value);

});

audio.volume = 0.7;


// 21. LIKE SONGS

function isLikedTrack(id) {

    return likedSongs.some(
        song => String(song.id) === String(id)
    );

}


function toggleLike(track) {

    if (isLikedTrack(track.id)) {

        likedSongs = likedSongs.filter(
            song => String(song.id) !== String(track.id)
        );

        showToast("Removed from Liked Songs");

    } else {

        likedSongs.unshift(track);

        showToast("Added to Liked Songs");

    }

    localStorage.setItem(
        "sonoraLiked",
        JSON.stringify(likedSongs)
    );

    updateLikePlayer();

}


function updateLikePlayer() {

    const track = songs[currentSongIndex];

    if (!track) return;

    const liked = isLikedTrack(track.id);

    document.getElementById("likeButton").innerHTML = liked
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';

    document.getElementById("likeButton")
        .classList.toggle("active", liked);

}


document.getElementById("likeButton")
.addEventListener("click", () => {

    const track = songs[currentSongIndex];

    if (track) {

        toggleLike(track);

    }

});


// 22. RECENTLY PLAYED

function saveRecent(track) {

    recentSongs = recentSongs.filter(
        song => String(song.id) !== String(track.id)
    );

    recentSongs.unshift(track);

    recentSongs = recentSongs.slice(0, 30);

    localStorage.setItem(
        "sonoraRecent",
        JSON.stringify(recentSongs)
    );

}


// 23. DISPLAY LIKED AND RECENT

function renderLiked() {

    renderSongList(likedSongs, likedResults);

}


function renderRecent() {

    renderSongList(recentSongs, recentResults);

}


// 24. PAGE NAVIGATION

function showPage(page) {

    document.querySelectorAll(".page").forEach(element => {

        element.classList.add("hidden");

    });

    const target = document.getElementById(page + "Page");

    if (target) {

        target.classList.remove("hidden");

    }

    document.querySelectorAll(".nav-link").forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.page === page
        );

    });

    activePage = page;

    if (page === "liked") renderLiked();

    if (page === "recent") renderRecent();

}


document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        const page = link.dataset.page;

        showPage(page);

        if (page === "search") {

            searchInput.focus();

        }

    });

});


// 25. GENRE SEARCH

document.querySelectorAll(".genre-card").forEach(button => {

    button.addEventListener("click", async () => {

        const genre = button.dataset.genre;

        showPage("search");

        document.getElementById("searchHeading").textContent =
            genre.toUpperCase() + " MUSIC";

        searchResults.innerHTML = `
            <p class="loading">Loading ${genre} tracks...</p>
        `;

        try {

            const results = await fetchMusic("", genre);

            renderSongList(results, searchResults);

            document.getElementById("resultCount").textContent =
                `${results.length} tracks`;

        } catch (error) {

            console.error(error);

            showToast("Unable to load genre.");

        }

    });

});


// 26. EXPLORE BUTTON

document.getElementById("exploreBtn")
.addEventListener("click", () => {

    showPage("search");

    searchInput.focus();

});


// 27. REFRESH MUSIC

document.getElementById("refreshBtn")
.addEventListener("click", loadHomeMusic);


// 28. CREATE PLAYLIST

document.getElementById("createPlaylist")
.addEventListener("click", () => {

    const name = prompt("Enter playlist name:");

    if (!name || !name.trim()) return;

    playlists.push({

        id: Date.now(),

        name: name.trim(),

        tracks: []

    });

    savePlaylists();

    renderPlaylists();

    showToast("Playlist created!");

});


function savePlaylists() {

    localStorage.setItem(
        "sonoraPlaylists",
        JSON.stringify(playlists)
    );

}


function renderPlaylists() {

    const container =
        document.getElementById("playlistContainer");

    container.innerHTML = "";

    if (!playlists.length) {

        container.innerHTML = `
            <p class="empty-playlist">
                Your playlists will appear here.
            </p>
        `;

        return;

    }

    playlists.forEach(playlist => {

        const button = document.createElement("button");

        button.textContent = "♫  " + playlist.name;

        button.addEventListener("click", () => {

            showToast(
                playlist.name + " · " +
                playlist.tracks.length + " songs"
            );

        });

        container.appendChild(button);

    });

}


// 29. SAVE SONG TO A PLAYLIST

// Right-click a search result to add it to a playlist.

searchResults.addEventListener("contextmenu", event => {

    const row = event.target.closest(".result-row");

    if (!row || !playlists.length) return;

    event.preventDefault();

    const trackName = row.querySelector(
        ".result-details h4"
    ).textContent;

    const track = songs.find(
        song => song.name === trackName
    );

    if (!track) {

        showToast("Play the song first, then add it.");

        return;

    }

    const names = playlists.map(
        (playlist, index) => `${index + 1}. ${playlist.name}`
    ).join("\n");

    const choice = Number(
        prompt("Choose playlist:\n" + names)
    ) - 1;

    if (!Number.isInteger(choice) ||
        !playlists[choice]) return;

    const list = playlists[choice];

    if (!list.tracks.some(
        item => String(item.id) === String(track.id)
    )) {

        list.tracks.push(track);

        savePlaylists();

        showToast("Added to " + list.name);

    }

});


// 30. BACK AND FORWARD BUTTONS

document.getElementById("backBtn")
.addEventListener("click", () => {

    showPage("home");

});

document.getElementById("forwardBtn")
.addEventListener("click", () => {

    showPage("search");

});


// 31. START APPLICATION

renderPlaylists();

loadHomeMusic();

showPage("home");
