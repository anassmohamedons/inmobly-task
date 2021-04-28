import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { DbService } from 'src/app/shared/services/db/db.service';
import { YoutubeService } from 'src/app/shared/services/youtube/youtube.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  videoId: string
  video: Video
  isLoading = true

  isFavorited = false
  rating = 0

  constructor(private route: ActivatedRoute, private api: YoutubeService, private db: DbService) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.params['id']
    this.getVideo(this.videoId)
  }

  getVideo = (videoId: string) => {
    this.api.getOneVideo(videoId).subscribe(async (res: VideoResponse) => {
      this.isFavorited = await this.db.checkFavorite(this.videoId)
      this.rating = await this.db.getRating(this.videoId)

      this.isLoading = false

      if (res.items.length > 0)
        this.video = res.items[0]
    })
  }

  toggleFavorite = () => {
    if (this.isFavorited)
      this.db.deleteFavorite(this.videoId)
    else this.db.addFavorite(this.videoId)

    this.isFavorited = !this.isFavorited
  }

  setRating = (e: { newValue: number }) => {
    this.db.setRating(this.videoId, e.newValue)
  }

  durationToSeconds = (duration: string) => {
    var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

    const newMatch = match?.slice(1).map((x) => {
      if (x != null)
        return x.replace(/\D/, '')

      return null
    })

    var hours = parseInt(newMatch && newMatch[0] ? newMatch[0] : '0')
    var minutes = parseInt(newMatch && newMatch[1] ? newMatch[1] : '0')
    var seconds = parseInt(newMatch && newMatch[2] ? newMatch[2] : '0')

    return hours * 3600 + minutes * 60 + seconds
  }

  formatNumber = (number: string) => {
    return new Intl.NumberFormat().format(parseInt(number))
  }
}
