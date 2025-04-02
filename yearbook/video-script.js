const video = document.getElementById("videoPlayer");

video.addEventListener("loadedmetadata", () => {
    console.log("Video duration:", video.duration);
});

video.addEventListener("play", () => {
    console.log("Video started playing");
});

video.addEventListener("pause", () => {
    console.log("Video paused");
});