document.addEventListener('DOMContentLoaded', function () {
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText');

    let currentVideoIndex = 0;
    let audioPlaying = false;
    let audioContext;
    let tranVideoAudioContext;
    const preloadedVideos = [];
    let gameOver = false;

    const assetsToLoad = [
        'wwwroot/assets/CowboyHead.gif',
        'wwwroot/assets/TranVid.mov',
        'wwwroot/videos/SW1.mp4',
        'wwwroot/videos/SW2.mp4',
        'wwwroot/videos/SW3.mp4',
        'wwwroot/videos/SW4.mp4',
        'wwwroot/videos/SW5.mp4',
        'wwwroot/videos/SW6.mp4',
        // Add more assets as needed
    ];

    const preload = new createjs.LoadQueue();
    preload.setMaxConnections(5);

    preload.loadManifest(assetsToLoad);

    preload.on('fileload', function (event) {
        const asset = event.item.src;

        if (asset.endsWith('.mp4')) {
            const videoElement = document.createElement('video');
            videoElement.src = asset;
            videoElement.preload = 'auto';
            videoElement.setAttribute('playsinline', '');
            preloadedVideos.push(videoElement);
        }

        if (preloadedVideos.length === assetsToLoad.length - 1) {
            loadingBar.style.display = 'none';
            startGame();
        }
    });

    function playVideoByIndex(index) {
        if (gameOver) {
            return;
        }

        const newVideo = preloadedVideos[index];
        videoPlayerContainer.innerHTML = '';
        videoPlayerContainer.appendChild(newVideo);
        newVideo.setAttribute('playsinline', '');
        newVideo.currentTime = 0;

        newVideo.addEventListener('ended', function () {
            newVideo.currentTime = 0;
            newVideo.play().catch(error => {
                console.error('Video playback error:', error.message);
            });
        });

        newVideo.play().catch(error => {
            console.error('Video playback error:', error.message);
        });

        preloadNextVideo();
    }

    function preloadNextVideo() {
        const nextIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        const nextVideo = preloadedVideos[nextIndex];

        if (!nextVideo.hasAttribute('src')) {
            nextVideo.src = preloadedVideos[nextIndex].src;
        }
    }

    document.addEventListener('click', function () {
        currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        const audioStartTime = preloadedVideos[currentVideoIndex].currentTime;
        preloadNextVideo();

        if (!audioPlaying) {
            createjs.Sound.registerSound({ src: 'wwwroot/assets/tranAudio.m4a', id: 'tranAudio' });
            const tranAudio = createjs.Sound.play('tranAudio', { interrupt: createjs.Sound.INTERRUPT_EARLY, volume: 1 });
            audioPlaying = true;

            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.connect(audioContext.destination);

            const audioSource = audioContext.createMediaElementSource(tranAudio);
            audioSource.connect(gainNode);

            loadingScreen.style.display = 'none';

            tranAudio.addEventListener('complete', function () {
                console.log('Game over!');
                gameOver = true;

                const gameOverMessage = document.createElement('div');
                gameOverMessage.textContent = 'Coming Soon..';
                gameOverMessage.style.fontSize = '75px';
                gameOverMessage.style.fontFamily = 'Futura, sans-serif';
                gameOverMessage.style.fontWeight = 'bold';
                gameOverMessage.style.color = '#eab5ac';
                gameOverMessage.style.textAlign = 'center';
                gameOverMessage.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)';
                gameOverMessage.style.position = 'absolute';
                gameOverMessage.style.top = '50%';
                gameOverMessage.style.left = '50%';
                gameOverMessage.style.transform = 'translate(-50%, -50%)';
                gameOverMessage.style.zIndex = '1000';
                document.body.appendChild(gameOverMessage);
            });
        }

        const tranVideo = document.getElementById('tranVideo');
        tranVideo.muted = true;

        if (!tranVideoAudioContext) {
            tranVideoAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const gainNode = tranVideoAudioContext.createGain();
        gainNode.gain.setValueAtTime(1, tranVideoAudioContext.currentTime);
        gainNode.connect(tranVideoAudioContext.destination);

        const videoSource = tranVideoAudioContext.createMediaElementSource(tranVideo);
        videoSource.connect(gainNode);

        tranVideo.addEventListener('ended', function () {
            tranVideo.style.display = 'none';
        });

        tranVideo.addEventListener('loadeddata', function () {
            startTranAudio();
            tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
        });
    });

    function startGame() {
        playVideoByIndex(0);
        loadingText.textContent = 'Click';
    }

    function startTranAudio() {
        if (tranVideoAudioContext && tranVideoAudioContext.state !== 'running') {
            tranVideoAudioContext.resume().then(() => {
                // Additional logic can be added if needed
            });
        }
    }
});
