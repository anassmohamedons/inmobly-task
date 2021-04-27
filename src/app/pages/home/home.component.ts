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
  resultsPerPage = 8

  constructor(private api: YoutubeService) { }

  ngOnInit(): void {
    this.fetchVideos()
  }

  fetchVideos = (pageToken: string = ''): void => {
    this.api.fetchVideos(this.channelId, pageToken).subscribe(this.handleResponse)
  }

  searchVideos = (e: KeyboardEvent): void => {
    if (e.key == "Enter" && this.searchQuery != "") {
      let queryParts = this.searchQuery.split(' ')

      this.api.searchVideos(this.channelId, this.searchQuery, '').subscribe((res: VideoResponse) => {
        res.items = res.items.filter((item: Video) => queryParts.some(q => item.snippet.title.toLowerCase().includes(q.toLowerCase())))
        this.handleResponse(res)
      })
    }
    else if (this.searchQuery == "")
      this.fetchVideos()
  }

  handleResponse = (res: VideoResponse) => {
    res.items.forEach(item => {
      item.title = item.snippet.title
      item.description = item.snippet.description
      item.publishedAt = item.snippet.publishedAt
    })

    this.dataSource = new MatTableDataSource(res.items)
    this.dataSource.sort = this.sort

    this.nextPageToken = res.items.length < this.api.resultsPerPage ? '' : res.nextPageToken
    this.prevPageToken = res.items.length < this.api.resultsPerPage ? '' : res.prevPageToken
  }

  showDetails = (videoId: string): void => { }

  paginate = (type: 'next' | 'prev') => {
    if (type == 'next' && this.nextPageToken)
      this.fetchVideos(this.nextPageToken)
    else if (type == 'prev' && this.prevPageToken)
      this.fetchVideos(this.prevPageToken)
  }
}
