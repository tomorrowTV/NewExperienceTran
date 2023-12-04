document.addEventListener('DOMContentLoaded', function () {
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingBarContainer');
    const loadingText = document.getElementById('loadingText'); // Add this line to get the loading text element

    let currentVideoIndex = 0;
    let videoPlaying = false;
    let audioPlaying = false;
    let audioStartTime = 0;
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

    // Add an event listener for user clicks to switch videos
    document.addEventListener('click', async function () {
        // Set the audio start time to match the current time in the current video
        audioStartTime = preloadedVideos[currentVideoIndex].currentTime;

        // Preload the next video
        preloadNextVideo();

        // Switch to the next video
        currentVideoIndex = (currentVideoIndex + 1) % preloadedVideos.length;

        // Use Promise.all to wait for both audio and video to be loaded before starting them
        await Promise.all([
            new Promise(resolve => {
                createjs.Sound.registerSound({ src: 'wwwroot/assets/tranAudio.m4a', id: 'tranAudio', onComplete: resolve });
            }),
            new Promise(resolve => {
                const tranVideo = preloadedVideos[currentVideoIndex];
                tranVideo.muted = true;

                if (!tranVideoAudioContext || tranVideoAudioContext.state !== 'running') {
                    tranVideoAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                    tranVideoAudioContext.resume().then(() => {
                        tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
                        resolve();
                    });
                } else {
                    tranVideo.play().catch(error => console.error('tranVideo playback error:', error.message));
                    resolve();
                }

                // Add an event listener for when tranVideo finishes
                tranVideo.addEventListener('ended', function () {
                    tranVideo.style.display = 'none';
                });
            })
        ]);

        // Start audio playback if not already playing
        if (!audioPlaying) {
            createjs.Sound.play('tranAudio');
            audioPlaying = true;

            // Hide the loading screen when video starts playing
            loadingScreen.style.display = 'none';

            // Add an event listener for when tranAudio finishes
            createjs.Sound.addEventListener('complete', function () {
                // End the game when tranAudio finishes
                // You can add your logic here to handle the end of the game
                console.log('Game over!');
                gameOver = true;

                // Display "Game Over" message on the screen
                const gameOverMessage = document.createElement('div');
                gameOverMessage.textContent = 'Coming Soon..';
                gameOverMessage.style.fontSize = '75px'; // Adjust styling as needed
                gameOverMessage.style.fontFamily = 'Futura, sans-serif'; // Adjust font family as needed
                gameOverMessage.style.fontWeight = 'bold'; // Adjust font weight as needed
                gameOverMessage.style.color = '#eab5ac'; // Adjust font color as needed
                gameOverMessage.style.textAlign = 'center'; // Center-align the text
                gameOverMessage.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.7)'; // Add a simple text shadow
                gameOverMessage.style.position = 'absolute';
                gameOverMessage.style.top = '50%';
                gameOverMessage.style.left = '50%';
                gameOverMessage.style.transform = 'translate(-50%, -50%)';
                gameOverMessage.style.zIndex = '1000'; // Set the z-index to a high value
                document.body.appendChild(gameOverMessage);
            });
        }
    });

    // Function to start the game
    function startGame() {
        // Start with the first video in the array
        playVideoByIndex(0);

        // Change loading text to "Click" when the game starts
        loadingText.textContent = 'Click';
    }
});
