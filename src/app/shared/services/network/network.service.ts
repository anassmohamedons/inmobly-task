import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  // Holds a boolean value if currently there is a network connection
  isOnline = true
  // Event emitter that can be subscribed to that emits the value of the
  // Network status when changed
  connectionChanged = new EventEmitter<boolean>()

  constructor() {
    // Initialize the isOnline variable with the current network status
    this.isOnline = navigator.onLine

    // Add an event listner for the window 'online' event and emit a 'true' value to the
    // connectionChanged event emitter, and also change the isOnline variable to the
    // New network state
    window.addEventListener('online', () => {
      this.connectionChanged.emit(true)
      this.isOnline = true
    })

    // Add an event listner for the window 'offline' event and emit a 'false' value to the
    // connectionChanged event emitter, and also change the isOnline variable to the
    // New network state
    window.addEventListener('offline', () => {
      this.connectionChanged.emit(false)
      this.isOnline = false
    })
  }
}
