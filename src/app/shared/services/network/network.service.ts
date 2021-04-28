import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  isOnline = true
  connectionChanged = new EventEmitter<boolean>()

  constructor() {
    this.isOnline = navigator.onLine
    window.addEventListener('online', () => {
      this.connectionChanged.emit(true)
      this.isOnline = true
    })

    window.addEventListener('offline', () => {
      this.connectionChanged.emit(false)
      this.isOnline = false
    })
  }
}
