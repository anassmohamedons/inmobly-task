import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { YoutubeService } from 'src/app/shared/services/youtube.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort

  channelId = 'UCWOA1ZGywLbqmigxE4Qlvuw'

  dataSource: MatTableDataSource<Video>
  gridColumns = ['thumbnail', 'title', 'publishedAt', 'actions']
  nextPageToken: string
  prevPageToken: string

  searchQuery = ''
  searcMode: boolean

  constructor(private api: YoutubeService) { }

  ngOnInit(): void {
    this.fetchVideos()
  }

  fetchVideos = (pageToken: string = ''): void => {
    this.api.fetchVideos(this.channelId, pageToken).subscribe((res: VideoResponse) => {
      res.items.forEach(item => {
        item.title = item.snippet.title
        item.description = item.snippet.description
        item.publishedAt = item.snippet.publishedAt
      })

      this.dataSource = new MatTableDataSource(res.items)
      this.dataSource.sort = this.sort

      this.nextPageToken = res.nextPageToken
      this.prevPageToken = res.prevPageToken
    })
  }

  showDetails = (videoId: string): void => { }

  paginate = (type: 'next' | 'prev') => {
    if (type == 'next' && this.nextPageToken)
      this.fetchVideos(this.nextPageToken)
    else if (type == 'prev' && this.prevPageToken)
      this.fetchVideos(this.prevPageToken)
  }
}
