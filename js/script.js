document.addEventListener('DOMContentLoaded', function () {
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText');

    let currentVideoIndex = 0;
    let audioPlaying = false;
    let audioStartTime = 0;
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
        newVideo.currentTime = audioStartTime;

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

    document.addEventListener('click', async function () {
        audioStartTime = preloadedVideos[currentVideoIndex].currentTime;
        preloadNextVideo();
        currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;

        const tranVideo = document.getElementById('tranVideo');
        tranVideo.muted = true;
        tranVideo.autoplay = true;

        if (!tranVideoAudioContext || tranVideoAudioContext.state !== 'running') {
            tranVideoAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            await tranVideoAudioContext.resume();
        }

        try {
            await tranVideo.play();
        } catch (error) {
            console.error('tranVideo playback error:', error.message);
        }

        tranVideo.addEventListener('ended', function () {
            tranVideo.style.display = 'none';
        });
    });

    function startGame() {
        playVideoByIndex(0);
        loadingText.textContent = 'Click';
    }
});
