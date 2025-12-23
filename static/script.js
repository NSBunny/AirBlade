document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const backBtn = document.getElementById('back-btn');
    const restartBtn = document.getElementById('restart-btn');
    const spinner = document.getElementById('spinner');
    const permOverlay = document.getElementById('perm-overlay');
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('game-canvas');

    const game = new window.FruitNinjaGame('game-canvas');
    let camera = null;
    let isActive = false;

    // MediaPipe Hands Setup
    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
        if (!isActive) return;
        game.update();
        game.render(videoElement, results);
    });

    async function startCamera() {
        if (!camera) {
            camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (isActive) {
                        await hands.send({ image: videoElement });
                    }
                },
                width: 640,
                height: 480
            });
        }
        await camera.start();
    }

    playBtn.addEventListener('click', async () => {
        playBtn.style.display = 'none';
        spinner.classList.remove('hidden');

        try {
            await startCamera();

            startScreen.classList.add('hidden');
            setTimeout(() => {
                startScreen.style.display = 'none';
                gameScreen.classList.remove('hidden');
                permOverlay.style.opacity = '0';
                setTimeout(() => permOverlay.style.display = 'none', 300);

                isActive = true;
                game.reset();
            }, 500);

        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access is required! " + err.message);
            playBtn.style.display = 'block';
            spinner.classList.add('hidden');
        }
    });

    restartBtn.addEventListener('click', () => {
        game.reset();
    });

    backBtn.addEventListener('click', () => {
        isActive = false;
        gameScreen.classList.add('hidden');
        startScreen.style.display = 'block';
        setTimeout(() => {
            startScreen.classList.remove('hidden');
            playBtn.style.display = 'block';
            spinner.classList.add('hidden');
        }, 300);
    });
});
