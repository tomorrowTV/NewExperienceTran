document.addEventListener('DOMContentLoaded', function () {
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText');

    let currentVideoIndex = 0;
    let tranAudio;
    let tranVideo;
    let tranVideoAudioContext;
    const preloadedVideos = [];
    let audioContext;
    let audioStartTime = 0;

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
            loadingScreen.style.display = 'none';  // Added this line to hide the loading screen
            videoPlayerContainer.style.display = 'block';  // Added this line to show the video player container
            startGame();
        }
    });

    function playVideoByIndex(index) {
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

    function startGame() {
        playVideoByIndex(0);
        loadingText.textContent = 'Click';
    }

    function startAudioAndVideo() {
        if (!tranAudio || tranAudio.getState() !== 'playFinished') {
            createjs.Sound.registerSound({ src: 'wwwroot/assets/tranAudio.m4a', id: 'tranAudio' });
            tranAudio = createjs.Sound.play('tranAudio', { loop: 0 });

            if (!audioContext || audioContext.state !== 'running') {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.resume().then(() => {
                    startTranVideo();
                });
            } else {
                startTranVideo();
            }
        }
    }

    function startTranVideo() {
        tranVideo = document.getElementById('tranVideo');
        tranVideo.muted = true;

        if (!tranVideoAudioContext || tranVideoAudioContext.state !== 'running') {
            tranVideoAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            tranVideoAudioContext.resume().then(() => {
                tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
            });
        } else {
            tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
        }

        tranVideo.addEventListener('ended', function () {
            audioStartTime = 0;
            startAudioAndVideo();
        });
    }

    document.addEventListener('click', function () {
        audioStartTime = preloadedVideos[currentVideoIndex].currentTime;
        preloadNextVideo();
        currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        startAudioAndVideo();
    });
});
