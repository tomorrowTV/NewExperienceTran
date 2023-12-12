document.addEventListener('DOMContentLoaded', function () {
    const tranVideo = document.getElementById('tranVideo');
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText');

    let currentVideoIndex = 0;
    let videoPlaying = false;
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

    // Function to play video by index
    function playVideoByIndex(index) {
        if (gameOver) {
            return;
        }

        const newVideo = preloadedVideos[index];
        const currentVideo = videoPlayerContainer.querySelector('video');

        if (currentVideo) {
            currentVideo.addEventListener('ended', function () {
                videoPlayerContainer.classList.remove('fade-in');
                videoPlayerContainer.classList.add('fade-out');
                currentVideo.currentTime = 0;
                currentVideo.play();
            });

            // Add fade-out class to current video
            videoPlayerContainer.classList.add('fade-out');
        }

        videoPlayerContainer.innerHTML = '';
        videoPlayerContainer.classList.remove('fade-out');
        videoPlayerContainer.classList.add('fade-in');

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


    // Function to preload the next video in the array
    function preloadNextVideo() {
        const nextIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        const nextVideo = preloadedVideos[nextIndex];

        if (!nextVideo.hasAttribute('src')) {
            nextVideo.src = preloadedVideos[nextIndex].src;
        }
    }

    document.addEventListener('click', function () {
        audioStartTime = preloadedVideos[currentVideoIndex].currentTime;
        preloadNextVideo();
        currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        playVideoByIndex(currentVideoIndex);

        if (!audioPlaying) {
            createjs.Sound.registerSound({ src: 'wwwroot/assets/tranAudio.m4a', id: 'tranAudio' });
            const tranAudio = createjs.Sound.play('tranAudio');
            audioPlaying = true;

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
        tranVideo.autoplay = true;

        if (!tranVideoAudioContext || tranVideoAudioContext.state !== 'running') {
            tranVideoAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            tranVideoAudioContext.resume().then(() => {
                tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
            });
        } else {
            tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
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
