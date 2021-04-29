import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Settings } from '../../models/settings';
import { Video } from '../../models/video.interface';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  constructor(private firestore: AngularFirestore) { }

  // Fetches the settings data from the 'settings' collection in Firestore
  getSettings = async (): Promise<Settings> => {
    // Convert the observer to a promise and wait for it
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('settings').doc('settings').get().toPromise()
    // Convert the response data to a Settings object
    return snapshot.data() as Settings
  }

  // Updates the current channel id by saving it to the 'settings' collection in Firestore
  updateChannel = (channelId: string) =>
    this.firestore.collection('settings').doc('settings').update({ channelId })

  // Gets all favorites saved in the 'favorites' collection in Firestore
  getFavorites = async (): Promise<Video[]> => {
    // Convert the observer to a promise and wait for it
    const snapshot: firebase.default.firestore.QuerySnapshot<unknown> = await this.firestore.collection('favorites').get().toPromise()
    // Convert the response data to an array of Video objects
    return snapshot.docs.map<Video>(d => d.data() as Video)
  }

  // Add a video to the 'favorites' collection in Firestore
  addFavorite = (videoId: string, video: Video) =>
    this.firestore.collection('favorites').doc(videoId).set({
      videoId,
      snippet: video.snippet
    })

  // Deletes a video from the 'favorites' collection in Firestore
  deleteFavorite = (videoId: string) =>
    this.firestore.collection('favorites').doc(videoId).delete()

  // Deletes all the videos from the 'favorites' collection in Firestore
  clearFavorites = (videos: Video[]) =>
    videos.forEach(video => this.firestore.collection('favorites').doc(video.videoId).delete())

  // Returns whether a video is in the 'favorites' collection in Firestore or not
  checkFavorite = async (videoId: string) => {
    // Convert the observer to a promise and wait for it
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('favorites').doc(videoId).get().toPromise()
    // Return the exists property that indicates if a document exists in a collection or not
    return snapshot.exists
  }

  // Updates the rating of a video by updating its raring value with the video it
  // In the 'ratings' collection in Firestore
  setRating = (videoId: string, rating: number) =>
    this.firestore.collection('ratings').doc(videoId).set({ rating })

  // Gets the current rating of a video from the 'ratings' collection in Firestore
  getRating = async (videoId: string): Promise<number> => {
    // Convert the observer to a promise and wait for it
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('ratings').doc(videoId).get().toPromise()
    // Return the rating value if the a document with this video id exists
    // Otherwise return a value of 0
    return snapshot.exists ? (snapshot.data() as any).rating : 0
  }
}
