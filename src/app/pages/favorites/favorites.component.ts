import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Video } from 'src/app/shared/models/video.interface';
import { DbService } from 'src/app/shared/services/db/db.service';
import { NetworkService } from 'src/app/shared/services/network/network.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  // Holds the list of favorited videos
  videos: Video[] = []
  
  // Boolean to check whether the Firestore is still loading or not
  isLoading = true

  constructor(private router: Router, private db: DbService, public connection: NetworkService) { }

  ngOnInit(): void {
    // Check if network is online to fetch favorites from Firestore, or load them from local storage
    if (this.connection.isOnline)
      this.getFavorites()
    else {
      // Store local storage item 'favorites' to a variable before settings values
      const localVideos = localStorage.getItem('favorites')
      // Parse the value only if not null otherwise use and empty array
      this.videos = localVideos ? JSON.parse(localVideos) : []
      this.isLoading = false
    }
  }

  // Gets list of favorites from Firestore
  getFavorites = () => {
    this.db.getFavorites().then(favorites => {
      // Set the videos array to the data from Firestore
      this.videos = favorites
      this.isLoading = false

      // Save a copy of the response to local storage
      localStorage.setItem('favorites', JSON.stringify(this.videos))
    })
  }

  // Click handler for 'Details' button on each video item
  showDetails = (video: Video): void => {
    this.router.navigate([`/watch/${video.videoId}`])
  }

  // Deletes a video from the favorites list, and also splicing it from the local array
  deleteFavorite = (video: Video, index: number) => {
    this.db.deleteFavorite(video.videoId)
    this.videos.splice(index, 1)
  }

  // Clears and deleted all favorites from Firestore and emptying the local array
  clearFavorites = () => {
    this.db.clearFavorites(this.videos)
    this.videos = []
  }
}
