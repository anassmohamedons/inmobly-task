import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { YoutubeService } from 'src/app/shared/services/youtube/youtube.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  video: Video
  isLoading = true

  constructor(private route: ActivatedRoute, private api: YoutubeService) { }

  ngOnInit(): void {
    this.getVideo(this.route.snapshot.params['id'])
  }

  getVideo = (videoId: string) => {
    this.api.getOneVideo(videoId).subscribe((res: VideoResponse) => {
      this.isLoading = false

      if (res.items.length > 0)
        this.video = res.items[0]
    })
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
