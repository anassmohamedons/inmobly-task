import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Settings } from '../../models/settings';
import { Video } from '../../models/video.interface';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  constructor(private firestore: AngularFirestore) { }

  getSettings = async (): Promise<Settings> => {
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('settings').doc('settings').get().toPromise()
    return snapshot.data() as Settings
  }

  updateChannel = (channelId: string) =>
    this.firestore.collection('settings').doc('settings').update({ channelId })

  getFavorites = async (): Promise<Video[]> => {
    const snapshot: firebase.default.firestore.QuerySnapshot<unknown> = await this.firestore.collection('favorites').get().toPromise()
    return snapshot.docs.map<Video>(d => d.data() as Video)
  }

  addFavorite = (videoId: string, video: Video) =>
    this.firestore.collection('favorites').doc(videoId).set({
      videoId,
      snippet: video.snippet
    })

  deleteFavorite = (videoId: string) =>
    this.firestore.collection('favorites').doc(videoId).delete()

  clearFavorites = (videos: Video[]) =>
    videos.forEach(video => this.firestore.collection('favorites').doc(video.videoId).delete())

  checkFavorite = async (videoId: string) => {
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('favorites').doc(videoId).get().toPromise()
    return snapshot.exists
  }

  setRating = (videoId: string, rating: number) =>
    this.firestore.collection('ratings').doc(videoId).set({ rating })

  getRating = async (videoId: string): Promise<number> => {
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('ratings').doc(videoId).get().toPromise()
    return snapshot.exists ? (snapshot.data() as any).rating : 0
  }
}
