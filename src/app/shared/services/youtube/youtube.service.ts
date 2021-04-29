import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ChannelResponse } from '../../models/channel.interface';
import { VideoResponse } from '../../models/video.interface';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  // YouTube API V3 endpoint and token
  private API_URL = 'https://www.googleapis.com/youtube/v3'
  private API_TOKEN = 'AIzaSyCjlJp-sLgC2vWtY5hqDPjaROEPLazn6cQ'

  // Holds how many videos to be showed per page
  resultsPerPage = 8

  constructor(private http: HttpClient) { }

  // Fetches videos from the 'public' playlist of a specific channel
  fetchVideos = (channelId: string, pageToken: string): Observable<VideoResponse> => {
    // To fetch the public videos of a channel using the YouTube API
    // We have to make two requests:
    //  1. Fetch channel data with part 'contentDetails' and get the 'public playlist id
    //  2. Request videos list using the fetched public playlist id
    // So the second request is dependent on the first request, RxJs is used to handle this

    // Set a variable for the channel data request url
    const channelRequestUrl = `${this.API_URL}/channels?key=${this.API_TOKEN}&part=contentDetails&id=${channelId}`
    // Set a variable for the playlist videos request url
    const videosRequestUrl = `${this.API_URL}/playlistItems?key=${this.API_TOKEN}&part=snippet,contentDetails&maxResults=${this.resultsPerPage}${pageToken != '' ? `&pageToken=${pageToken}` : ''}`

    // Do a GET request to the first url
    return this.http.get(channelRequestUrl).pipe(
      // Use RxJs switchMap operator to take the response of the first request and
      // Feed it to the second one
      switchMap((response: any) => {
        // Destruct the response data and use the 'items' key
        const { items }: { items: ChannelResponse[] } = response
        // If data is returned from the request continue
        if (items && items.length > 0) {
          // Put a reference to the uploads playlist in a variable
          const playlistId = items[0].contentDetails.relatedPlaylists.uploads
          // Return the response of the second request that fetched the 'public' playlist
          // Videos and use RxJs map operator to return the whole response
          return this.http.get(`${videosRequestUrl}&playlistId=${playlistId}`).pipe(map((response: any) => response))
        }

        // Otherwise return an empty array
        return of([])
      })
    )
  }

  // Searches videos using a search query and the current channel id
  // And an optional pageToken
  searchVideos = (channelId: string, searchQuery: string, pageToken: string): Observable<VideoResponse> => {
    // Set a variable for the search data request url
    const searchRequestUrl = `${this.API_URL}/search?key=${this.API_TOKEN}&channelId=${channelId}&q=${encodeURI(searchQuery)}&part=snippet&maxResults=${this.resultsPerPage}${pageToken != '' ? `&pageToken=${pageToken}` : ''}`

    // Do a GET request to fetch the search result and use the
    // RxJs map operator to return the whole response
    return this.http.get(searchRequestUrl).pipe(
      map((response: any) => response)
    )
  }

  // Fetches the data of a specific video
  getOneVideo = (videoId: string): Observable<VideoResponse> => {
    // Set a variable for the video data request url
    const videoRequestUrl = `${this.API_URL}/videos?key=${this.API_TOKEN}&part=snippet,contentDetails,statistics&id=${videoId}`

    // Do a GET request to fetch the search result and use the
    // RxJs map operator to return the whole response
    return this.http.get(videoRequestUrl).pipe(
      map((response: any) => response)
    )
  }
}
