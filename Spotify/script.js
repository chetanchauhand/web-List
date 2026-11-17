
const audio = document.getElementById("audioPlayer");

const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const previousBtn = document.getElementById("previousBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentCover = document.getElementById("currentCover");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

// SONG DATABASE

const songs = [
    {
        title: "Chill Evening",
        artist: "Relaxing Music",
        file: "songs/song1.mp3",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
    },
    {
        title: "Trending Hits",
        artist: "Popular Collection",
        file: "songs/song2.mp3",
        cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400"
    },
    {
        title: "Night Drive",
        artist: "Midnight Sounds",
        file: "songs/song3.mp3",
        cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400"
    },
    {
        title: "Deep Focus",
        artist: "Study Music",
        file: "songs/song4.mp3",
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400"
    }
];

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isLiked = false;

// DISPLAY SONG LIST

const songList = document.getElementById("songList");

songs.forEach((song, index) => {

    const row = document.createElement("div");

    row.className = "song-row";

    row.innerHTML = `
        <span class="song-number">${index + 1}</span>

        <img src="${song.cover}" alt="Album cover">

        <div class="song-details">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>

        <span class="row-duration">Play</span>
    `;

    row.addEventListener("click", () => {
        loadSong(index);
        playSong();
    });

    songList.appendChild(row);

});


// LOAD SONG

function loadSong(index) {

    currentIndex = index;

    const song = songs[currentIndex];

    audio.src = song.file;

    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    currentCover.src = song.cover;

    progressBar.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    isLiked = false;
    updateLikeButton();
}


// PLAY SONG

function playSong() {

    if (!audio.src) {
        loadSong(currentIndex);
    }

    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
        })
        .catch(() => {
            isPlaying = false;
            updatePlayButton();
            alert("Song file nahi mili! Apne songs folder me MP3 files check karo.");
        });

}


// PAUSE SONG

function pauseSong() {

    audio.pause();

    isPlaying = false;

    updatePlayButton();

}


// PLAY / PAUSE BUTTON

playBtn.addEventListener("click", () => {

    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }

});


function updatePlayButton() {

    playBtn.innerHTML = isPlaying
        ? '<i class="fa-solid fa-pause"></i>'
        : '<i class="fa-solid fa-play"></i>';

}


// NEXT SONG

function nextSong() {

    if (isShuffle && songs.length > 1) {

        let randomIndex;

        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentIndex);

        loadSong(randomIndex);

    } else {

        currentIndex++;

        if (currentIndex >= songs.length) {
            currentIndex = 0;
        }

        loadSong(currentIndex);

    }

    playSong();

}


// PREVIOUS SONG

function prevSong() {

    if (audio.currentTime > 3) {

        audio.currentTime = 0;
        return;

    }

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }

    loadSong(currentIndex);

    playSong();

}

nextBtn.addEventListener("click", nextSong);
previousBtn.addEventListener("click", prevSong);


// QUICK PLAYLISTS

document.querySelectorAll("[data-song]").forEach(card => {

    card.addEventListener("click", () => {

        const index = Number(card.dataset.song);

        loadSong(index);

        playSong();

    });

});


// PROGRESS BAR

audio.addEventListener("timeupdate", () => {

    if (audio.duration && Number.isFinite(audio.duration)) {

        const progress =
            (audio.currentTime / audio.duration) * 100;

        progressBar.value = progress;

        currentTime.textContent =
            formatTime(audio.currentTime);

        duration.textContent =
            formatTime(audio.duration);

    }

});

progressBar.addEventListener("input", () => {

    if (audio.duration && Number.isFinite(audio.duration)) {

        audio.currentTime =
            (progressBar.value / 100) * audio.duration;

    }

});


// TIME FORMAT

function formatTime(time) {

    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);

    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;

}


// AUTO NEXT

audio.addEventListener("ended", () => {

    if (audio.loop) return;

    nextSong();

});


// VOLUME CONTROL

volumeBar.addEventListener("input", () => {

    audio.volume = volumeBar.value;

});

audio.volume = 0.7;


// SHUFFLE

const shuffleBtn = document.getElementById("shuffleBtn");

shuffleBtn.addEventListener("click", () => {

    isShuffle = !isShuffle;

    shuffleBtn.style.color =
        isShuffle ? "#1ed760" : "#b3b3b3";

});


// REPEAT

const repeatBtn = document.getElementById("repeatBtn");

repeatBtn.addEventListener("click", () => {

    audio.loop = !audio.loop;

    repeatBtn.style.color =
        audio.loop ? "#1ed760" : "#b3b3b3";

});


// LIKE BUTTON

const likeBtn = document.getElementById("likeBtn");

likeBtn.addEventListener("click", () => {

    isLiked = !isLiked;

    updateLikeButton();

});

function updateLikeButton() {

    likeBtn.innerHTML = isLiked
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';

    likeBtn.classList.toggle("liked", isLiked);

}


// CREATE PLAYLIST

document.getElementById("createPlaylist").addEventListener("click", createPlaylist);

document.getElementById("addPlaylist").addEventListener("click", createPlaylist);

function createPlaylist() {

    const name = prompt("Enter your playlist name:");

    if (!name || !name.trim()) return;

    const playlist = document.createElement("div");

    playlist.className = "playlist-box";

    playlist.innerHTML = `
        <h4>${escapeHTML(name.trim())}</h4>
        <p>Your new playlist</p>
        <button class="browse-playlist">Open playlist</button>
    `;

    document.querySelector(".library").appendChild(playlist);

}


// PREVENT HTML INJECTION IN PLAYLIST NAME

function escapeHTML(value) {

    return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}


// INITIAL SONG

loadSong(0);
