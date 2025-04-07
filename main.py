from dotenv import load_dotenv
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import pprint

# Load .env variables
load_dotenv()

# Create Spotify API client with playback control scopes
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope="user-read-playback-state user-read-currently-playing user-modify-playback-state app-remote-control streaming"
))

# Function to search and play a song by keyword
def play_song(song_name: str):
    results = sp.search(q=song_name, type='track', limit=1)
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        track_uri = track['uri']
        track_name = track['name']
        artist_name = track['artists'][0]['name']

        print(f"🎵 Playing: {track_name} by {artist_name}")
        sp.start_playback(uris=[track_uri])
    else:
        print("❌ No results found.")

# Function to show currently playing track
def show_current_playback():
    current = sp.current_playback()
    if current and current.get('is_playing'):
        track = current['item']
        pprint.pprint(f"▶️ Currently Playing: {track} by {track['artists'][0]['name']}")
    else:
        print("⏹️ No track is currently playing.")

# Example usage
song_to_play = input("Enter a song to play: ")
play_song(song_to_play)

# Show what’s playing
show_current_playback()
