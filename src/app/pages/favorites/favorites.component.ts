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
  videos: Video[] = []

  isLoading = true

  constructor(private router: Router, private db: DbService, public connection: NetworkService) { }

  ngOnInit(): void {
    if (this.connection.isOnline)
      this.getFavorites()
    else {
      const localVideos = localStorage.getItem('favorites')
      this.videos = localVideos ? JSON.parse(localVideos) : []
      this.isLoading = false
    }
  }

  getFavorites = () => {
    this.db.getFavorites().then(favorites => {
      this.videos = favorites
      this.isLoading = false

      localStorage.setItem('favorites', JSON.stringify(this.videos))
    })
  }

  showDetails = (video: Video): void => {
    this.router.navigate([`/watch/${video.videoId}`])
  }

  deleteFavorite = (video: Video, index: number) => {
    this.db.deleteFavorite(video.videoId)
    this.videos.splice(index, 1)
  }

  clearFavorites = () => {
    this.db.clearFavorites(this.videos)
    this.videos = []
  }
}
