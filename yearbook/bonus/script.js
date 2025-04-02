document.addEventListener("DOMContentLoaded", () => {
    const mediaElements = document.querySelectorAll("audio, video");
    const playButtons = document.querySelectorAll(".playPause");
    const seekBars = document.querySelectorAll(".seekBar");
    const currentTimeDisplays = document.querySelectorAll(".currentTime");
    const durationDisplays = document.querySelectorAll(".duration");

    mediaElements.forEach((media, index) => {
        const playButton = playButtons[index];
        const seekBar = seekBars[index];
        const currentTimeDisplay = currentTimeDisplays[index];
        const durationDisplay = durationDisplays[index];

        // Update duration when metadata is loaded
        media.addEventListener("loadedmetadata", () => {
            durationDisplay.textContent = formatTime(media.duration);
            seekBar.max = media.duration;
        });

        // Play/Pause Button
        playButton.addEventListener("click", () => {
            if (media.paused) {
                media.play();
                playButton.textContent = "❚❚";
            } else {
                media.pause();
                playButton.textContent = "▶";
            }
        });

        // Update seek bar and time display
        media.addEventListener("timeupdate", () => {
            seekBar.value = media.currentTime;
            currentTimeDisplay.textContent = formatTime(media.currentTime);
        });

        // Seek functionality
        seekBar.addEventListener("input", () => {
            media.currentTime = seekBar.value;
        });

        // Format time function
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
        }
    });
});
