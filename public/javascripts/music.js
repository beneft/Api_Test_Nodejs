const spotifyData = JSON.parse(document.getElementById('spotifyData').textContent);
const trackUri = spotifyData.uri;
// Initialize the Spotify Player SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    const token = spotifyData.token; // Use the access token obtained from the Spotify API

    const player = new Spotify.Player({
        name: 'Player',
        getOAuthToken: cb => { cb(token); },
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        console.log(state);
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);

        // Play the selected track
        player._options.getOAuthToken(token => {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                method: 'PUT',
                body: JSON.stringify({ uris: [trackUri] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        });
    });

    // Connect to the player
    player.connect();
};