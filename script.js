console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");


/* ---------------- UTIL ---------------- */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------- LOAD SONGS ---------------- */
async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`/${folder}/songs.json`);
    songs = await res.json();

    console.log(songs);
    console.log("no songs found");
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Unknown Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText);
        });
    });

    return songs;
}

/* ---------------- PLAY MUSIC ---------------- */
function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

/* ---------------- DISPLAY ALBUMS ---------------- */
async function displayAlbums() {
    let res = await fetch("/songs/albums.json");
    let albums = await res.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of albums) {
        let infoRes = await fetch(`/songs/${folder}/info.json`);
        let info = await infoRes.json();

        cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
            <div class="play">▶</div>
            <img src="/songs/${folder}/cover.jpg">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        </div>`;
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

/* ---------------- MAIN ---------------- */
async function main() {
    await getSongs("songs/Angry_(mood)");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.offsetWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
