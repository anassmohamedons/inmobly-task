import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { DbService } from 'src/app/shared/services/db/db.service';
import { NetworkService } from 'src/app/shared/services/network/network.service';
import { YoutubeService } from 'src/app/shared/services/youtube/youtube.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  // Current youtube video id
  videoId: string
  // Current video object that gets filled by the API
  video: Video
  
  // Boolean to check whether the API is still loading or not
  isLoading = true

  // Boolean to check if the current video is favorited or not
  isFavorited = false
  // This holds the current video rating
  rating = 0

  constructor(private route: ActivatedRoute, private api: YoutubeService, private db: DbService, public connection: NetworkService) { }

  ngOnInit(): void {
    // Set the videoId variable to the video id param from the current url
    this.videoId = this.route.snapshot.params['id']
    // Gets video data using the API
    this.getVideo()

    // Subscribe to network state changes, and reload video data if it was not fetched before
    this.connection.connectionChanged.subscribe(status => {
      if (status && this.isLoading)
        this.getVideo()
    })
  }

  // Make a request to the API with the current video id and fetch its data
  getVideo = () => {
    this.api.getOneVideo(this.videoId).subscribe(async (res: VideoResponse) => {
      // Set the favorite variable to the value from Firestore
      this.isFavorited = await this.db.checkFavorite(this.videoId)
      // Set the rating variable to the value from Firestore
      this.rating = await this.db.getRating(this.videoId)

      this.isLoading = false

      // Only update the video object if data is returned from the API
      if (res.items.length > 0)
        this.video = res.items[0]
    })
  }

  // Toggles the current video favorite state, and saved to Firestore
  toggleFavorite = () => {
    if (this.isFavorited)
      this.db.deleteFavorite(this.videoId)
    else this.db.addFavorite(this.videoId, this.video)

    this.isFavorited = !this.isFavorited
  }

  // Saves the updated rating set by the rating component
  setRating = (e: { newValue: number }) => {
    this.db.setRating(this.videoId, e.newValue)
  }

  // Convert YouTube API video duration to seconds
  durationToSeconds = (duration: string) => {
    // Regex match to split duration value to chuncks
    var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

    // Map matches to itself without the prefix letters
    const newMatch = match?.slice(1).map((x) => x != null ? x.replace(/\D/, '') : null)

    // Parse parts of the duration string to integers
    var hours = parseInt(newMatch && newMatch[0] ? newMatch[0] : '0')
    var minutes = parseInt(newMatch && newMatch[1] ? newMatch[1] : '0')
    var seconds = parseInt(newMatch && newMatch[2] ? newMatch[2] : '0')

    // Convert above timings to sum of seconds
    return hours * 3600 + minutes * 60 + seconds
  }

  // Format numbers to use commas
  formatNumber = (number: string) =>
    new Intl.NumberFormat().format(parseInt(number))
}
