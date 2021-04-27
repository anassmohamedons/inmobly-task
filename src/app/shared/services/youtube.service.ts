import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ChannelResponse } from '../models/channel.interface';
import { VideoResponse } from '../models/video.interface';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private API_URL = 'https://www.googleapis.com/youtube/v3';
  private API_TOKEN = 'AIzaSyCjlJp-sLgC2vWtY5hqDPjaROEPLazn6cQ';

  resultsPerPage = 8

  constructor(private http: HttpClient) { }

  fetchVideos = (channelId: string, pageToken: string): Observable<VideoResponse> => {
    const channelRequestUrl = `${this.API_URL}/channels?key=${this.API_TOKEN}&part=contentDetails&id=${channelId}`
    const videosRequestUrl = `${this.API_URL}/playlistItems?key=${this.API_TOKEN}&part=snippet&maxResults=${this.resultsPerPage}${pageToken != '' ? `&pageToken=${pageToken}` : ''}`

    return this.http.get(channelRequestUrl).pipe(
      switchMap((response: any) => {
        const { items }: { items: ChannelResponse[] } = response
        if (items && items.length > 0) {
          const playlistId = items[0].contentDetails.relatedPlaylists.uploads
          return this.http.get(`${videosRequestUrl}&playlistId=${playlistId}`).pipe(map((response: any) => response))
        }

        return of([])
      })
    )
  }

  searchVideos = (channelId: string, searchQuery: string, pageToken: string): Observable<VideoResponse> => {
    const searchRequestUrl = `${this.API_URL}/search?key=${this.API_TOKEN}&channelId=${channelId}&q=${encodeURI(searchQuery)}&part=snippet&maxResults=${this.resultsPerPage}${pageToken != '' ? `&pageToken=${pageToken}` : ''}`

    return this.http.get(searchRequestUrl).pipe(
      map((response: any) => response)
    )
  }
}
