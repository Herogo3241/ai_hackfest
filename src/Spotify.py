from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import pprint

class Spotify:
    def __init__(self):
        load_dotenv()
        self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIFY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
            scope="user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming"
        ))
        
    def play_song(self, song_name: str):
        results = self.sp.search(q=song_name, type='track', limit=1)
        if results['tracks']['items']:
            track = results['tracks']['items'][0]
            track_uri = track['uri']
            track_name = track['name']
            artist_name = track['artists'][0]['name']

            print(f"🎵 Playing: {track_name} by {artist_name}")
            self.sp.start_playback(uris=[track_uri])
        else:
            print("❌ No results found.")
            
    def show_current_playback(self):
        current = self.sp.current_playback()
        if current and current.get('is_playing'):
            track = current['item']
            pprint.pprint(f"Currently Playing: {track} by {track['artists'][0]['name']}")
        else:
            print("No track is currently playing.")