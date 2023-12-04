document.addEventListener('DOMContentLoaded', function () {
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText'); // Add this line to get the loading text element

    let currentVideoIndex = 0;
    let videoPlaying = false;
    let audioPlaying = false;
    let audioStartTime = 0;
    let audioContext;
    let tranVideoAudioContext;
    const preloadedVideos = [];
    let gameOver = false; // New flag to track the game state

    // Define assets to preload
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

    // Preload assets with progress tracking
    preload.loadManifest(assetsToLoad);

    // Add an event listener for when each asset is loaded
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
            // All videos are preloaded, hide loading bar and start the game
            loadingBar.style.display = 'none';
            startGame();
        }
    });

    // Function to play video by index
    function playVideoByIndex(index) {

        if (gameOver) {
            // If the game is over, do not play the video
            return;
        }
        
        const newVideo = preloadedVideos[index];
        videoPlayerContainer.innerHTML = ''; // Clear container
        videoPlayerContainer.appendChild(newVideo);

        // Add the 'playsinline' attribute for mobile devices
        newVideo.setAttribute('playsinline', '');

        // Set the current time in the video to match the audio start time
        newVideo.currentTime = audioStartTime;

        console.log('Before play: audioStartTime =', audioStartTime);

        // Add an event listener for when the video ends
        newVideo.addEventListener('ended', function () {
            // Start the video over from the beginning
            newVideo.currentTime = 0;
            newVideo.play().catch(error => {
                console.error('Video playback error:', error.message);
            });
        });
        
        newVideo.play().catch(error => {
            console.error('Video playback error:', error.message);
        });

        // Preload the next video while the current video is playing
        preloadNextVideo();
        
        console.log('After play');
    }

    // Function to preload the next video in the array
    function preloadNextVideo() {
        const nextIndex = (currentVideoIndex + 1) % preloadedVideos.length;
        const nextVideo = preloadedVideos[nextIndex];

        if (!nextVideo.hasAttribute('src')) {
            // Set the 'src' attribute to trigger preload
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

            console.log('tranAudio:', tranAudio);
            console.log('Type of tranAudio:', typeof tranAudio);

            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioSource = audioContext.createMediaElementSource(tranAudio);
            audioSource.connect(audioContext.destination);

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

        const videoSource = tranVideoAudioContext.createMediaElementSource(tranVideo);
        videoSource.connect(tranVideoAudioContext.destination);

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
                // You can add any additional logic here if needed
            });
        }
    }
});
