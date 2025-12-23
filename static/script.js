document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const videoFeed = document.getElementById('video-feed');
    const backBtn = document.getElementById('back-btn');
    const restartBtn = document.getElementById('restart-btn');
    const spinner = document.getElementById('spinner');
    const permOverlay = document.getElementById('perm-overlay');

    let stream = null;

    playBtn.addEventListener('click', async () => {
        // Show loading state
        playBtn.style.display = 'none';
        spinner.classList.remove('hidden');

        try {
            // Request camera permission properly using browser API
            stream = await navigator.mediaDevices.getUserMedia({ video: true });

            // If we get here, permission is granted
            // We immediately stop this local stream because the backend needs the camera
            stream.getTracks().forEach(track => track.stop());

            // Transition UI
            startScreen.classList.add('hidden');
            setTimeout(() => {
                startScreen.style.display = 'none';
                gameScreen.classList.remove('hidden');

                // Start backend stream
                permOverlay.style.opacity = '0';
                setTimeout(() => permOverlay.style.display = 'none', 300);

                // Set the sink for the backend video
                // Use a timestamp to prevent caching
                videoFeed.src = `/video_feed?t=${Date.now()}`;
            }, 500);

        } catch (err) {
            console.error("Camera permission denied or error:", err);
            alert("Camera permission is required to play this game! Please allow access.");

            // Reset UI
            playBtn.style.display = 'block';
            spinner.classList.add('hidden');
        }
    });

    restartBtn.addEventListener('click', () => {
        // Briefly clear source to force disconnect/reconnect
        videoFeed.src = '';
        permOverlay.style.display = 'flex';
        permOverlay.style.opacity = '1';
        permOverlay.querySelector('p').textContent = 'Reloading...';

        setTimeout(() => {
            videoFeed.src = `/video_feed?t=${Date.now()}`;
            permOverlay.style.opacity = '0';
            setTimeout(() => {
                permOverlay.style.display = 'none';
                permOverlay.querySelector('p').textContent = 'Waiting for Camera Access...';
            }, 300);
        }, 500);
    });

    backBtn.addEventListener('click', () => {
        // Stop the feed (by removing src)
        videoFeed.src = '';

        // Return to home
        gameScreen.classList.add('hidden');
        startScreen.style.display = 'block';

        // Small delay to allow fade out
        setTimeout(() => {
            startScreen.classList.remove('hidden');
            permOverlay.style.display = 'flex';
            permOverlay.style.opacity = '1';

            // Reset start button
            playBtn.style.display = 'block';
            spinner.classList.add('hidden');
        }, 300);
    });
});
