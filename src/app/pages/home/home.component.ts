import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { YoutubeService } from 'src/app/shared/services/youtube/youtube.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  channelId = 'UCWOA1ZGywLbqmigxE4Qlvuw'

  videos: Video[] = []
  videosUnsorted: Video[] = []
  gridColumns = ['thumbnail', 'title', 'publishedAt', 'actions']
  nextPageToken: string
  prevPageToken: string

  isLoading = true

  searchQuery = ''
  resultsPerPage = 8

  sortedBy: string
  sortedByType: string

  changeChannelMode = false
  newChannel: string

  constructor(private api: YoutubeService, private router: Router) { }

  ngOnInit(): void {
    this.fetchVideos()
  }

  fetchVideos = (pageToken: string = ''): void => {
    this.isLoading = true
    this.api.fetchVideos(this.channelId, pageToken).subscribe(this.handleResponse)
  }

  searchVideos = (e: KeyboardEvent): void => {
    if (e.key == "Enter") {
      this.isLoading = true

      if (this.searchQuery == "") {
        this.fetchVideos()
        return
      }

      const queryParts = this.searchQuery.split(' ')

      this.api.searchVideos(this.channelId, this.searchQuery, '').subscribe((res: VideoResponse) => {
        res.items = res.items.filter((item: Video) => queryParts.some(q => item.snippet.title.toLowerCase().includes(q.toLowerCase())))
        this.handleResponse(res)
      })
    }
  }

  handleResponse = (res: VideoResponse) => {
    this.isLoading = false
    this.videos = res.items
    this.videosUnsorted = res.items
    this.sortedBy = ''
    this.sortedByType = ''

    this.nextPageToken = res.items.length < this.api.resultsPerPage ? '' : res.nextPageToken
    this.prevPageToken = res.items.length < this.api.resultsPerPage ? '' : res.prevPageToken
  }

  showDetails = (video: Video): void => {
    this.router.navigate([`watch/${video.snippet.resourceId.videoId}`])
  }

  paginate = (type: 'next' | 'prev') => {
    if (type == 'next' && this.nextPageToken)
      this.fetchVideos(this.nextPageToken)
    else if (type == 'prev' && this.prevPageToken)
      this.fetchVideos(this.prevPageToken)
  }

  sortBy = (column: string) => {
    if (this.sortedBy == column)
      this.sortedByType = this.sortedByType == 'asc' ? 'desc' : 'asc'
    else
      this.sortedByType = 'asc'

    this.sortedBy = column

    if (column == 'title') {
      if (this.sortedByType == 'asc')
        this.videos = this.videos.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title))
      else
        this.videos = this.videos.sort((a, b) => b.snippet.title.localeCompare(a.snippet.title))
    }
    else if (column == 'publishedAt') {
      if (this.sortedByType == 'asc')
        this.videos = this.videos.sort((a, b) => new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime())
      else
        this.videos = this.videos.sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime())
    }
  }

  showChannelChanger = () => {
    this.newChannel = ''
    this.changeChannelMode = !this.changeChannelMode
  }

  changeChannel = (e: KeyboardEvent) => {
    if (e.key == "Enter" && this.newChannel != "") {
      if (this.newChannel.startsWith('https://www.youtube.com/channel/')) {
        const channelIdMatches = this.newChannel.match(/youtube.com\/channel\/([^#\&\?]*).*/)
        if (channelIdMatches && channelIdMatches.length == 2) {
          this.channelId = channelIdMatches[1]
          this.fetchVideos()
        }
      } else {
        this.channelId = this.newChannel
        this.fetchVideos()
      }

      this.changeChannelMode = false
    }
  }
}
