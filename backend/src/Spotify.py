from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth

class Spotify:
    def __init__(self):
        load_dotenv()
        self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
            scope="user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming"
        ))

    def play_mood_mix(self, mood: str):
        query = f"{mood} mix"
        results = self.sp.search(q=query, type='playlist', limit=10)
        playlists = results.get('playlists', {}).get('items', [])

        if not playlists:
            print(f"❌ No playlists found for mood: {mood}")
            return

        # Look for exact match like "Sad Mix"
        for playlist in playlists:
            if playlist and 'name' in playlist and playlist['name'].lower() == f"{mood.lower()} mix":
                print(f"🎧 Playing: {playlist['name']}")
                self.sp.start_playback(context_uri=playlist['uri'])
                return

        # Fallback: Play the first playlist found
        for playlist in playlists:
            if playlist and 'name' in playlist:
                print(f"🎧 Playing closest match: {playlist['name']}")
                self.sp.start_playback(context_uri=playlist['uri'])
                return

        print(f"❌ No valid '{mood} mix' found.")


    def show_current_playback(self):
        current = self.sp.current_playback()
        if current and current.get('is_playing'):
            track = current['item']
            print(f"🎶 Currently Playing: {track['name']} by {track['artists'][0]['name']}")
        else:
            print("⏸️ No track is currently playing.")
