from Spotify import Spotify
import time


spotify = Spotify()


# Example usage
song = input("Enter a song to play: ")
spotify.play_song(song)

time.sleep(2)

# Show what’s playing
spotify.show_current_playback()
