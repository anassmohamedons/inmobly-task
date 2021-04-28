import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Settings } from '../../models/settings';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  constructor(private firestore: AngularFirestore) { }

  getSettings = async (): Promise<Settings> => {
    const snapshot: firebase.default.firestore.DocumentSnapshot<unknown> = await this.firestore.collection('settings').doc('settings').get().toPromise()
    return snapshot.data() as Settings
  }

  updateChannel = (channelId: string) => {
    this.firestore.collection('settings').doc('settings').update({ channelId })
  }

  addFavorite = (videoId: string) =>
    this.firestore.collection('favorites').doc(videoId).set({ videoId })

  deleteFavorite = (videoId: string) =>
    this.firestore.collection('favorites').doc(videoId).delete()

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
