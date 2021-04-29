import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Video, VideoResponse } from 'src/app/shared/models/video.interface';
import { DbService } from 'src/app/shared/services/db/db.service';
import { NetworkService } from 'src/app/shared/services/network/network.service';
import { YoutubeService } from 'src/app/shared/services/youtube/youtube.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Current channel id
  channelId: string

  // List of current videos shown
  videos: Video[] = []
  // Copy of current videos unsorted
  videosUnsorted: Video[] = []

  // Next and Previous page tokens from the YouTube API
  nextPageToken: string
  prevPageToken: string

  // Boolean to check whether the API is still loading or not
  isLoading = true

  // Hold the current search input value
  searchQuery = ''

  // What column of the video is used in sorting
  sortedBy: string
  // Stores the sorting direction; asc or desc
  sortedByType: string

  // Boolean for change channel ui to be shown/hidden
  changeChannelMode = false
  // Holds the value of the new channel input
  newChannel: string

  constructor(private api: YoutubeService, private db: DbService, private router: Router, public connection: NetworkService) { }

  async ngOnInit() {
    // Loads the current channel id from Firestor and save it to local storage
    // if network connection is present, otherwise load videos saved in the local storage
    if (this.connection.isOnline) {
      // Load channel id from Firestore
      this.channelId = (await this.db.getSettings()).channelId
      // Save fetched channel id to local storage
      localStorage.setItem('channelId', this.channelId)
    }
    else {
      // Store local storage item 'channelId' to a variable before settings values
      const channelId = localStorage.getItem('channelId')
      // Parse the value only if not null otherwise use a default channel id
      this.channelId = channelId ? channelId : 'UCWOA1ZGywLbqmigxE4Qlvuw'
    }

    // Request videos from the API
    this.fetchVideos()
  }

  // Fetches videos of the current channel
  fetchVideos = (pageToken: string = ''): void => {
    this.isLoading = true

    // Fetch videos from the API if there is an internet connection, otherwise fetch them from local storage
    if (this.connection.isOnline)
      this.api.fetchVideos(this.channelId, pageToken).subscribe(this.handleResponse)
    else {
      // Store local storage item 'videos' to a variable before settings values
      const localVideos = localStorage.getItem('videos')
      // Parse the value only if not null otherwise use an empty array
      this.videos = localVideos ? JSON.parse(localVideos) : []
      this.isLoading = false
    }
  }

  // Handles Enter key pressed on the search input field
  searchVideos = (e: KeyboardEvent): void => {
    // If the key value from the KeyboardEvent is the 'Enter' key then continue
    if (e.key == "Enter") {
      this.isLoading = true

      // If the search input value is empty fetch videos without searching and return
      if (this.searchQuery.trim() == "") {
        this.fetchVideos()
        return
      }

      // Splits search input value into keywords array that gets passed to the API
      const queryParts = this.searchQuery.split(' ')

      // Search for videos with the search query using the API
      this.api.searchVideos(this.channelId, this.searchQuery, '').subscribe((res: VideoResponse) => {
        // YouTube API searches videos and matching query on both 'title' and 'description' of the video
        // So filter data again to leave out videos that matched using the 'description' field only
        res.items = res.items.filter((item: Video) => queryParts.some(q => item.snippet.title.toLowerCase().includes(q.toLowerCase())))
        this.handleResponse(res)
      })
    }
  }

  handleResponse = (res: VideoResponse) => {
    this.isLoading = false
    // Set the videos array to the result of the API
    this.videos = res.items
    // Set the unsorted video array to the result of the API
    this.videosUnsorted = res.items

    // Set sorting variables to their defaults
    this.sortedBy = ''
    this.sortedByType = ''

    // Set pagination tokens variables to values from the API
    this.nextPageToken = res.items.length < this.api.resultsPerPage ? '' : res.nextPageToken
    this.prevPageToken = res.items.length < this.api.resultsPerPage ? '' : res.prevPageToken

    // Request data to be saved to the local storage
    this.saveVideosToLocalStorage()
  }

  // Saved the current videos array to the local storage
  saveVideosToLocalStorage = () => {
    localStorage.setItem('videos', JSON.stringify(this.videos))
  }

  // Handles the click of the 'Details' button for each video
  showDetails = (video: Video): void => {
    this.router.navigate([`/watch/${video.snippet.resourceId.videoId}`])
  }

  // Navigate through pagination with pre saved pagination tokens
  paginate = (type: 'next' | 'prev') => {
    // If the next button was pressed, fetch videos using the next page token
    if (type == 'next' && this.nextPageToken)
      this.fetchVideos(this.nextPageToken)
    // If the previous button was pressed, fetch videos using the previous page token
    else if (type == 'prev' && this.prevPageToken)
      this.fetchVideos(this.prevPageToken)
  }

  // Sorts the current videos array using a column from the 'column' parameter
  sortBy = (column: string) => {
    // If clicked the same column again to sort, toggle between the sort type; asc or desc
    // And default to asc if not the same column was pressed
    if (this.sortedBy == column)
      this.sortedByType = this.sortedByType == 'asc' ? 'desc' : 'asc'
    else
      this.sortedByType = 'asc'

    // Updates the sorting variable to the pressed column
    this.sortedBy = column

    // Sort using the 'title' column alphabetically using the sort type
    if (column == 'title') {
      if (this.sortedByType == 'asc')
        this.videos = this.videos.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title))
      else
        this.videos = this.videos.sort((a, b) => b.snippet.title.localeCompare(a.snippet.title))
    }
    // Sort using the 'publishedAt' column using the sort type
    else if (column == 'publishedAt') {
      if (this.sortedByType == 'asc')
        this.videos = this.videos.sort((a, b) => new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime())
      else
        this.videos = this.videos.sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime())
    }
  }

  // Shows the channel changer ui and resets the change channel input value
  showChannelChanger = () => {
    this.newChannel = ''
    this.changeChannelMode = !this.changeChannelMode
  }

  // Handles Enter key pressed on the change channel input field
  changeChannel = (e: KeyboardEvent) => {
    // If the key value from the KeyboardEvent is the 'Enter' key
    // And the change channel input value is not empty then continue
    if (e.key == "Enter" && this.newChannel != "") {
      // If the change channel input value starts with a YouTube channel link
      // Then the links gets parsed and the channel id is taken from the url
      if (this.newChannel.startsWith('https://www.youtube.com/channel/')) {
        // Regex to match the channel id from a YouTube channel link
        const channelIdMatches = this.newChannel.match(/youtube.com\/channel\/([^#\&\?]*).*/)
        // Update the current channel id if a match was found, and fetch videos using the new channel id
        if (channelIdMatches && channelIdMatches.length == 2) {
          this.channelId = channelIdMatches[1]
          this.fetchVideos()
        }
      // If the change channel input has a value of a channel id, then update the current channel
      // And fetch videos using the new channel id
      // Note: The API handles if an invalid channel id is used
      } else {
        this.channelId = this.newChannel
        this.fetchVideos()
      }

      // Hide the change channel UI
      this.changeChannelMode = false
      // Updates the current channel id to the new channel id
      // Or use the same channel id if nothing was changed
      this.db.updateChannel(this.channelId)
    }
  }
}
